<?php

namespace Database\Seeders;

use App\Models\UnitType;
use Illuminate\Database\Seeder;

class UnitTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $unitTypes = [
            ['name' => 'Studio'],
            ['name' => '1 Bedroom'],
            ['name' => '2 Bedrooms'],
            ['name' => '3 Bedrooms'],
            ['name' => '4+ Bedrooms'],
            ['name' => 'Apartment'],
            ['name' => 'Commercial Space'],
            ['name' => 'Office'],
            ['name' => 'Shop'],
            ['name' => 'Warehouse'],
        ];

        foreach ($unitTypes as $type) {
            UnitType::firstOrCreate(['name' => $type['name']]);
        }
    }
}