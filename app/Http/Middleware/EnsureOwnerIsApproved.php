<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOwnerIsApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $next($request);
        }

        abort_unless($user->role === 'owner', 403);

        if (!$user->isApproved() || $user->isExpired()) {
            return redirect()->route('account.status');
        }

        return $next($request);
    }
}
