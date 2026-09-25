<?php

namespace App\Http\Controllers;

use App\Services\PropertyDescriptionGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AIDescriptionController extends Controller
{
    public function generatePropertyDescription(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'nullable|string|max:255',
                'property_type_id' => 'nullable|exists:property_types,id',
                'address' => 'nullable|string|max:255',
                'total_units' => 'nullable|integer|min:0',
                'total_floors' => 'nullable|integer|min:1',
                'amenities' => 'nullable|array',
                'proximity' => 'nullable|array',
                'cell_id' => 'nullable|exists:cells,id',
                'province_name' => 'nullable|string|max:255',
                'district_name' => 'nullable|string|max:255',
                'sector_name' => 'nullable|string|max:255',
                'cell_name' => 'nullable|string|max:255',
                'unit_size_range' => 'nullable|string|max:255',
            ]);

            $inputs = [
                'name' => $validated['name'] ?? null,
                'property_type_name' => null,
                'address' => $validated['address'] ?? null,
                'total_units' => $validated['total_units'] ?? null,
                'total_floors' => $validated['total_floors'] ?? null,
                'amenities' => array_keys(array_filter($request->input('amenities', []))),
                'proximity' => array_keys(array_filter($request->input('proximity', []))),
                'location_parts' => [
                    'province' => $validated['province_name'] ?? null,
                    'district' => $validated['district_name'] ?? null,
                    'sector' => $validated['sector_name'] ?? null,
                    'cell' => $validated['cell_name'] ?? null,
                ],
                'unit_size_range' => $validated['unit_size_range'] ?? null,
            ];

            if (!empty($validated['property_type_id'])) {
                $inputs['property_type_name'] = \App\Models\PropertyType::find($validated['property_type_id'])?->name;
            }

            $service = new PropertyDescriptionGenerator();
            $result = $service->generate($inputs);

            return response()->json([
                'description' => $result['description'],
                'source' => $result['source'],
            ], 200);
        } catch (\Exception $e) {
            Log::error('AI generate failed: ' . $e->getMessage());

            $validated = $request->all();
            $inputs = [
                'name' => $validated['name'] ?? null,
                'property_type_name' => null,
                'address' => $validated['address'] ?? null,
                'total_units' => $validated['total_units'] ?? null,
                'total_floors' => $validated['total_floors'] ?? null,
                'amenities' => array_keys(array_filter($request->input('amenities', []))),
                'proximity' => array_keys(array_filter($request->input('proximity', []))),
                'location_parts' => [
                    'province' => $validated['province_name'] ?? null,
                    'district' => $validated['district_name'] ?? null,
                    'sector' => $validated['sector_name'] ?? null,
                    'cell' => $validated['cell_name'] ?? null,
                ],
                'unit_size_range' => $validated['unit_size_range'] ?? null,
            ];

            if (!empty($validated['property_type_id'])) {
                $inputs['property_type_name'] = \App\Models\PropertyType::find($validated['property_type_id'])?->name;
            }

            $service = new PropertyDescriptionGenerator();
            $fallback = $service->generateTemplate($inputs);

            $description = $fallback['description'] . ' [Note: AI service temporarily unavailable — using local template.]';

            return response()->json([
                'description' => $description,
                'source' => 'fallback',
            ], 200);
        }
    }
}
