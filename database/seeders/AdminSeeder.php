<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@ituzeqraltd.com'],
            [
                'first_name' => 'Ituze',
                'last_name' => 'Admin',
                'name' => 'Ituze Admin',
                'phone' => '0780000000',
                'role' => 'admin',
                'status' => 'approved',
                'expires_at' => now()->addYear(),
                'profile_completed' => true,
                'email_verified_at' => now(),
                'password' => Hash::make('Admin@2026'),
            ]
        );
    }
}