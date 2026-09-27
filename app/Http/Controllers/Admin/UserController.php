<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class UserController extends Controller
{
    protected function filteredUsers(Request $request)
    {
        $search = $request->input('search');
        $role = $request->input('role');
        $status = $request->input('status');

        return User::query()
            ->with('sector.district.province')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($role, fn ($query) => $query->where('role', $role))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest();
    }

    public function index(Request $request): InertiaResponse
    {
        $users = $this->filteredUsers($request)->paginate(10)->withQueryString();
        $users->getCollection()->transform(function (User $user) {
            $expiresAt = $user->expires_at;
            $user->setAttribute('plan_is_expired', !$user->isAdmin() && $user->isExpired());
            $user->setAttribute(
                'plan_remaining_days',
                $expiresAt && !$user->isAdmin()
                    ? max(0, (int) now()->startOfDay()->diffInDays($expiresAt->copy()->startOfDay(), false))
                    : null
            );

            return $user;
        });

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => [
                'search' => $request->input('search'),
                'role' => $request->input('role'),
                'status' => $request->input('status'),
            ],
        ]);
    }

    public function updatePlan(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->role === 'owner', 404);

        $validated = $request->validate([
            'renew' => ['sometimes', 'accepted'],
            'expires_at' => ['sometimes', 'required', 'date', 'after:today'],
        ]);

        if (empty($validated['renew']) && !isset($validated['expires_at'])) {
            return back()->withErrors(['plan' => 'Choose a new plan end date or renew for one year.']);
        }

        $newExpiry = DB::transaction(function () use ($user, $validated): Carbon {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            abort_unless($lockedUser->role === 'owner', 404);

            if (!empty($validated['renew'])) {
                $currentExpiry = $lockedUser->expires_at;
                $renewalStart = $currentExpiry && $currentExpiry->isFuture()
                    ? $currentExpiry
                    : now();
                $newExpiry = $renewalStart->copy()->addYear();
            } else {
                $newExpiry = Carbon::parse($validated['expires_at'])->endOfDay();
            }

            $lockedUser->forceFill(['expires_at' => $newExpiry])->save();

            return $newExpiry;
        });

        return back()->with('status', 'Owner plan updated. Access is available until '.$newExpiry->toDateString().'.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return back()->withErrors(['user' => 'Admin accounts cannot be deleted.']);
        }

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $user->delete();

        return back()->with('status', 'Account deleted permanently.');
    }

    public function exportExcel(Request $request)
    {
        $users = $this->filteredUsers($request)->get();

        $callback = function () use ($users) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Name', 'Email', 'Phone', 'Role', 'Status', 'National ID', 'Location', 'Joined', 'Expires']);

            foreach ($users as $user) {
                $location = $user->sector
                    ? $user->sector->name.', '.optional($user->sector->district)->name
                    : '';

                fputcsv($handle, [
                    $user->name,
                    $user->email,
                    $user->phone,
                    $user->role,
                    $user->status,
                    $user->national_id,
                    $location,
                    $user->created_at->format('Y-m-d'),
                    $user->expires_at?->format('Y-m-d'),
                ]);
            }

            fclose($handle);
        };

        return Response::streamDownload($callback, 'users-'.now()->format('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $users = User::query()
            ->with('sector.district.province')
            ->orderBy('id')
            ->get();

        $pdf = Pdf::loadView('admin.users-pdf', [
            'users' => $users,
            'generatedAt' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('users-'.now()->format('Y-m-d').'.pdf');
    }
}