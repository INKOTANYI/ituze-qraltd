<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TenancyController extends Controller
{
    /**
     * Create a tenant that can be assigned to a unit owned by the current user.
     */
    public function storeTenant(Request $request, Property $property): RedirectResponse
    {
        $this->authorizePropertyAccess($request->user(), $property);

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

        Tenant::create($data + ['status' => 'active']);

        return back()->with('success', 'Tenant created successfully.');
    }

    /**
     * Assign a tenant and occupy a unit in one transaction.
     */
    public function store(Request $request, Property $property, Unit $unit): RedirectResponse
    {
        $this->authorizePropertyAccess($request->user(), $property);

        if ($unit->property_id !== $property->id) {
            abort(404);
        }

        $data = $request->validate([
            'tenant_id' => ['required', 'exists:tenants,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'monthly_rent' => ['required', 'numeric', 'min:0'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        DB::transaction(function () use ($data, $request, $unit) {
            $lockedUnit = Unit::whereKey($unit->id)->lockForUpdate()->firstOrFail();

            if ($lockedUnit->status !== 'vacant' ||
                $lockedUnit->tenancies()->where('status', 'active')->exists()) {
                throw ValidationException::withMessages([
                    'unit_id' => 'This unit is not vacant or already has an active tenancy.',
                ]);
            }

            $tenant = Tenant::whereKey($data['tenant_id'])
                ->where('status', 'active')
                ->first();
            if (!$tenant) {
                throw ValidationException::withMessages([
                    'tenant_id' => 'The selected tenant is not active.',
                ]);
            }

            Tenancy::create([
                'unit_id' => $lockedUnit->id,
                'tenant_id' => $tenant->id,
                'assigned_by' => $request->user()->id,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'monthly_rent' => $data['monthly_rent'],
                'deposit_amount' => $data['deposit_amount'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => 'active',
            ]);

            $lockedUnit->update(['status' => 'occupied']);
        });

        return redirect()->route('properties.units.index', $property)
            ->with('success', 'Tenant assigned and unit marked occupied.');
    }

    private function authorizePropertyAccess($user, Property $property): void
    {
        if (!$user->isAdmin() && $property->owner_id !== $user->id) {
            abort(403, 'You do not have permission to access this property.');
        }
    }
}
