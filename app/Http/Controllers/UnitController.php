<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Unit;
use App\Models\UnitType;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    // Middleware is handled in routes/web.php

    /**
     * Display a listing of units for a property.
     */
    public function index(Request $request, Property $property): Response
    {
        $this->authorizePropertyAccess($request->user(), $property);

        $units = Unit::with(['unitType', 'activeTenancy.tenant'])
            ->where('property_id', $property->id)
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                return $query->where('unit_number', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $unitTypes = UnitType::all();
        $tenants = \App\Models\Tenant::where('status', 'active')
            ->when(!$request->user()->isAdmin(), function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('created_by', $request->user()->id)
                        ->orWhereHas('tenancies.unit.property', function ($property) use ($request) {
                            $property->where('owner_id', $request->user()->id);
                        });
                });
            })
            ->when($request->tenant_search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->limit(100)
            ->get(['id', 'type', 'name', 'email', 'phone', 'registration_number']);

        return Inertia::render('Units/Index', [
            'property' => $property->load('cell.sector.district.province'),
            'units' => $units,
            'unitTypes' => $unitTypes,
            'tenants' => $tenants,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Show the form for creating a new unit.
     */
    public function create(Request $request, Property $property): Response
    {
        $this->authorizePropertyAccess($request->user(), $property);

        $unitTypes = UnitType::all();

        return Inertia::render('Units/Create', [
            'property' => $property,
            'unitTypes' => $unitTypes,
        ]);
    }

    /**
     * Store a newly created unit in storage.
     */
    public function store(Request $request, Property $property): RedirectResponse
    {
        try {
            $this->authorizePropertyAccess($request->user(), $property);

            $request->validate([
                'unit_type_id' => 'required|exists:unit_types,id',
                'unit_number' => 'required|string|max:50',
                'rent_amount' => 'required|numeric|min:0',
                'size_sqm' => 'nullable|numeric|min:0',
                'description' => 'nullable|string',
                'status' => 'required|in:vacant,occupied,maintenance',
            ]);

            $unit = Unit::create([
                'property_id' => $property->id,
                'unit_type_id' => $request->unit_type_id,
                'unit_number' => $request->unit_number,
                'rent_amount' => $request->rent_amount,
                'size_sqm' => $request->size_sqm,
                'description' => $request->description,
                'status' => $request->status,
            ]);

            Log::info('Unit created: #' . $unit->id . ' ('. $unit->unit_number .') for property #' . $property->id);

            return redirect()->route('properties.units.index', $property)
                ->with('success', '✅ Unit "' . $unit->unit_number . '" created successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Unit store validation failed: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            Log::error('Unit store error: ' . $e->getMessage());
            return back()
                ->with('error', '❌ Failed to save unit: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified unit.
     */
    public function show(Request $request, Property $property, Unit $unit): Response
    {
        $this->authorizePropertyAccess($request->user(), $property);
        
        if ($unit->property_id !== $property->id) {
            abort(404);
        }

        $unit->load('unitType', 'property', 'activeTenancy.tenant', 'activeTenancy.leases');

        return Inertia::render('Units/Show', [
            'property' => $property,
            'unit' => $unit,
        ]);
    }

    /**
     * Show the form for editing the specified unit.
     */
    public function edit(Request $request, Property $property, Unit $unit): Response
    {
        $this->authorizePropertyAccess($request->user(), $property);
        
        if ($unit->property_id !== $property->id) {
            abort(404);
        }

        $unitTypes = UnitType::all();

        return Inertia::render('Units/Edit', [
            'property' => $property,
            'unit' => $unit->load('unitType'),
            'unitTypes' => $unitTypes,
        ]);
    }

    /**
     * Update the specified unit in storage.
     */
    public function update(Request $request, Property $property, Unit $unit): RedirectResponse
    {
        try {
            $this->authorizePropertyAccess($request->user(), $property);

            if ($unit->property_id !== $property->id) {
                abort(404);
            }

            $request->validate([
                'unit_type_id' => 'required|exists:unit_types,id',
                'unit_number' => 'required|string|max:50',
                'rent_amount' => 'required|numeric|min:0',
                'size_sqm' => 'nullable|numeric|min:0',
                'description' => 'nullable|string',
                'status' => 'required|in:vacant,occupied,maintenance',
            ]);

            $unit->update([
                'unit_type_id' => $request->unit_type_id,
                'unit_number' => $request->unit_number,
                'rent_amount' => $request->rent_amount,
                'size_sqm' => $request->size_sqm,
                'description' => $request->description,
                'status' => $request->status,
            ]);

            Log::info('Unit updated: #' . $unit->id . ' (' . $unit->unit_number . ')');

            return redirect()->route('properties.units.index', $property)
                ->with('success', '✅ Unit "' . $unit->unit_number . '" updated successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Unit update validation failed: ' . json_encode($e->errors()));
            throw $e;
        } catch (\Exception $e) {
            Log::error('Unit update error: ' . $e->getMessage());
            return back()
                ->with('error', '❌ Failed to update unit: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified unit from storage.
     */
    public function destroy(Request $request, Property $property, Unit $unit): RedirectResponse
    {
        try {
            $this->authorizePropertyAccess($request->user(), $property);

            if ($unit->property_id !== $property->id) {
                abort(404);
            }

            $unitNum = $unit->unit_number;
            $unit->delete();

            Log::info('Unit deleted: ' . $unitNum . ' (property #' . $property->id . ')');

            return redirect()->route('properties.units.index', $property)
                ->with('success', '🗑️ Unit "' . $unitNum . '" deleted successfully.');

        } catch (\Exception $e) {
            Log::error('Unit destroy error: ' . $e->getMessage());
            return back()
                ->with('error', '❌ Failed to delete unit: ' . $e->getMessage());
        }
    }

    /**
     * Check if user can access the property.
     */
    private function authorizePropertyAccess($user, $property)
    {
        if (!$user->isAdmin() && $property->owner_id !== $user->id) {
            abort(403, 'You do not have permission to access this property.');
        }
    }
}