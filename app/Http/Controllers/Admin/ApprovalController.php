<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function index(): Response
    {
        $pending = User::where('role', 'owner')
            ->where('status', 'pending')
            ->where('profile_completed', true)
            ->with('sector.district.province')
            ->latest()
            ->get();

        return Inertia::render('Admin/Approvals', [
            'pendingUsers' => $pending,
        ]);
    }

    public function approve(User $user): RedirectResponse
    {
        $user->update(['status' => 'approved']);

        return back()->with('status', 'Account approved.');
    }

    public function reject(User $user): RedirectResponse
    {
        $user->update(['status' => 'rejected']);

        return back()->with('status', 'Account rejected.');
    }
}