<?php

namespace App\Http\Controllers;

use App\Models\Cell;
use App\Models\District;
use App\Models\Province;
use App\Models\Sector;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function provinces(): JsonResponse
    {
        return response()->json(
            Province::orderBy('name')->get(['id', 'name'])
        );
    }

    public function districts(Province $province): JsonResponse
    {
        return response()->json(
            District::where('province_id', $province->id)
                ->orderBy('name')
                ->get(['id', 'name'])
        );
    }

    public function sectors(District $district): JsonResponse
    {
        return response()->json(
            Sector::where('district_id', $district->id)
                ->orderBy('name')
                ->get(['id', 'name'])
        );
    }

    public function cells(Sector $sector): JsonResponse
    {
        return response()->json(
            Cell::where('sector_id', $sector->id)
                ->orderBy('name')
                ->get(['id', 'name'])
        );
    }
}