<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Tenant::query()
            ->with(['activeTenancies.unit.property'])
            ->withCount('activeTenancies')
            ->when(!$user->isAdmin(), function ($query) use ($user) {
                $query->whereHas('tenancies.unit.property', fn ($property) => $property->where('owner_id', $user->id));
            })
            ->when($request->search, function ($query, $search) {
                $query->where(fn ($q) => $q
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%"));
            })
            ->latest();

        return Inertia::render('Tenants/Index', [
            'tenants' => $query->paginate(12)->withQueryString(),
            'filters' => ['search' => $request->search],
            'isAdmin' => $user->isAdmin(),
        ]);
    }
}
