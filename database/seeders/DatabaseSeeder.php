<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            LocationsSeeder::class,
            UnitTypeSeeder::class,
            PropertyTypeSeeder::class,
            AdminSeeder::class,
        ]);

        if (User::where('email', 'test@example.com')->doesntExist()) {
            User::factory()->create([
                'first_name' => 'Test',
                'last_name' => 'User',
                'name' => 'Test User',
                'email' => 'test@example.com',
                'role' => 'owner',
                'status' => 'approved',
                'expires_at' => now()->addYear(),
                'profile_completed' => true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
