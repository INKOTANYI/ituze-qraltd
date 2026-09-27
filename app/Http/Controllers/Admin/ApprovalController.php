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
        $pending = User::where('role', 'owner')
            ->where('status', 'pending')
            ->where('profile_completed', true)
            ->whereNotNull('email_verified_at')
            ->with('sector.district.province')
            ->latest()
            ->get();

        return Inertia::render('Admin/Approvals', [
            'pendingUsers' => $pending,
        ]);
    }

    public function approve(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->role === 'owner', 404);
        $request->validate([
            'payment_verified' => ['required', 'accepted'],
        ]);

        abort_unless($user->status === 'pending', 409, 'This owner is no longer pending approval.');
        abort_unless($user->hasVerifiedEmail() && $user->profile_completed, 422, 'The owner must verify their email and complete their profile before approval.');

        $user->update([
            'status' => 'approved',
            'expires_at' => now()->addYear(),
        ]);

        return back()->with('status', 'Owner account approved. The one-year subscription starts today.');
    }

    public function reject(User $user): RedirectResponse
    {
        abort_unless($user->role === 'owner', 404);
        $user->update(['status' => 'rejected']);

        return back()->with('status', 'Account rejected.');
    }
}