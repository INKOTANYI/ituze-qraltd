<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function index(): Response
    {
        $pending = User::whereIn('role', ['owner', 'tenant'])
            ->where('status', 'pending')
            ->where('profile_completed', true)
            ->with('sector.district.province')
            ->latest()
            ->get();

        return Inertia::render('Admin/Approvals', [
            'pendingUsers' => $pending,
        ]);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        $user->update(['status' => 'approved']);

        if ($user->role === 'tenant') {
            $user->tenantProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'created_by' => $request->user()->id,
                    'type' => 'individual',
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'national_id' => $user->national_id,
                    'status' => 'active',
                ],
            );
        }

        return back()->with('status', 'Account approved and tenant profile created.');
    }

    public function reject(User $user): RedirectResponse
    {
        $user->update(['status' => 'rejected']);

        return back()->with('status', 'Account rejected.');
    }
}