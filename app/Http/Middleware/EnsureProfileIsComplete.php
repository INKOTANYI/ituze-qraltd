<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileIsComplete
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->profile_completed && ! $request->routeIs('profile.complete', 'profile.complete.store', 'logout')) {
            return redirect()->route('profile.complete');
        }

        return $next($request);
    }
}