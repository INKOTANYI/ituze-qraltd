<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TenantController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'in:individual,company'],
            'name' => ['required', 'string', 'max:255'],
            'registration_number' => ['nullable', 'required_if:type,company', 'string', 'max:100'],
            'contact_person' => ['nullable', 'required_if:type,company', 'string', 'max:255'],
            'national_id' => ['nullable', 'required_if:type,individual', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
        ]);

        Tenant::create($data + [
            'created_by' => $request->user()->id,
            'status' => 'active',
        ]);

        return back()->with('success', 'Tenant created successfully.');
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = Tenant::query()
            ->with(['activeTenancies.unit.property'])
            ->withCount('activeTenancies')
            ->when(!$user->isAdmin(), function ($query) use ($user) {
                $query->where(function ($query) use ($user) {
                    $query->where('created_by', $user->id)
                        ->orWhereHas('tenancies.unit.property', fn ($property) => $property->where('owner_id', $user->id));
                });
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
