<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Tenant;
use App\Models\Tenancy;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TenancyController extends Controller
{
    private const LEASE_MAX_KB = 10240;

    private const LEASE_MIMES = 'pdf,doc,docx,jpg,jpeg,png';

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

        Tenant::create($data + [
            'created_by' => $request->user()->id,
            'status' => 'active',
        ]);

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

            $tenantQuery = Tenant::whereKey($data['tenant_id'])->where('status', 'active');
            if (!$request->user()->isAdmin()) {
                $tenantQuery->where(function ($query) use ($request) {
                    $query->where('created_by', $request->user()->id)
                        ->orWhereHas('tenancies.unit.property', fn ($property) => $property->where('owner_id', $request->user()->id));
                });
            }
            $tenant = $tenantQuery->first();
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

    public function uploadLease(Request $request, Property $property, Unit $unit, Tenancy $tenancy): RedirectResponse
    {
        $this->authorizeTenancyAccess($request->user(), $property, $unit, $tenancy);

        try {
            $data = $request->validate([
                'lease' => ['required', 'file', 'mimes:' . self::LEASE_MIMES, 'max:' . self::LEASE_MAX_KB],
                'notes' => ['nullable', 'string', 'max:1000'],
            ]);
            $file = $data['lease'];
            $path = $file->store('leases/' . $tenancy->id, 'local');
            $tenancy->leases()->create([
                'uploaded_by' => $request->user()->id,
                'original_name' => $file->getClientOriginalName(),
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'notes' => $data['notes'] ?? null,
            ]);
            return back()->with('success', 'Lease uploaded successfully.');
        } catch (ValidationException $e) {
            Log::warning('Lease upload validation failed.', ['user_id' => $request->user()->id, 'tenancy_id' => $tenancy->id, 'errors' => $e->errors()]);
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Lease upload failed.', ['user_id' => $request->user()->id, 'tenancy_id' => $tenancy->id, 'error' => $e->getMessage()]);
            return back()->with('error', 'The lease could not be uploaded.');
        }
    }

    public function downloadLease(Request $request, Property $property, Unit $unit, Tenancy $tenancy, \App\Models\Lease $lease): StreamedResponse
    {
        $this->authorizeTenancyAccess($request->user(), $property, $unit, $tenancy);
        $this->ensureLeaseBelongsToTenancy($lease, $tenancy);
        if (!Storage::disk('local')->exists($lease->path)) {
            Log::warning('Lease download requested for missing file.', ['lease_id' => $lease->id]);
            abort(404);
        }
        return Storage::disk('local')->download($lease->path, $lease->original_name);
    }

    public function deleteLease(Request $request, Property $property, Unit $unit, Tenancy $tenancy, \App\Models\Lease $lease): RedirectResponse
    {
        $this->authorizeTenancyAccess($request->user(), $property, $unit, $tenancy);
        $this->ensureLeaseBelongsToTenancy($lease, $tenancy);
        Storage::disk('local')->delete($lease->path);
        $lease->delete();
        return back()->with('success', 'Lease deleted successfully.');
    }

    private function authorizeTenancyAccess($user, Property $property, Unit $unit, Tenancy $tenancy): void
    {
        if (!$user->isAdmin() && $property->owner_id !== $user->id) {
            Log::warning('Unauthorized lease access attempt.', [
                'user_id' => $user->id,
                'property_id' => $property->id,
                'tenancy_id' => $tenancy->id,
            ]);
            abort(403, 'You do not have permission to access this property.');
        }
        if ($unit->property_id !== $property->id || $tenancy->unit_id !== $unit->id) {
            abort(404);
        }
    }

    private function ensureLeaseBelongsToTenancy(\App\Models\Lease $lease, Tenancy $tenancy): void
    {
        if ($lease->tenancy_id !== $tenancy->id) {
            abort(404);
        }
    }

    private function authorizePropertyAccess($user, Property $property): void
    {
        if (!$user->isAdmin() && $property->owner_id !== $user->id) {
            abort(403, 'You do not have permission to access this property.');
        }
    }
}
