<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'filters' => [
                'search' => $request->input('search'),
                'role' => $request->input('role'),
                'status' => $request->input('status'),
            ],
        ]);
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
        $users = $this->filteredUsers($request)->get();

        $pdf = Pdf::loadView('admin.users-pdf', ['users' => $users]);

        return $pdf->download('users-'.now()->format('Y-m-d').'.pdf');
    }
}