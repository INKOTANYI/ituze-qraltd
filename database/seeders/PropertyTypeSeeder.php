<?php

namespace Database\Seeders;

use App\Models\PropertyType;
use Illuminate\Database\Seeder;

class PropertyTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $propertyTypes = [
            ['name' => 'Office'],
            ['name' => 'Apartment'],
            ['name' => 'Warehouse'],
            ['name' => 'Commercial'],
        ];

        foreach ($propertyTypes as $type) {
            PropertyType::firstOrCreate(['name' => $type['name']]);
        }
    }
}
