<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VerifyEmailOtpController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        if (! $user->email_otp || $user->email_otp !== $request->otp) {
            return back()->withErrors(['otp' => 'The code you entered is incorrect.']);
        }

        if (! $user->email_otp_expires_at || $user->email_otp_expires_at->isPast()) {
            return back()->withErrors(['otp' => 'This code has expired. Please request a new one.']);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_otp' => null,
            'email_otp_expires_at' => null,
        ])->save();

        return redirect()->route('dashboard');
    }
}