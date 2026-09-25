<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Preserve existing accounts while removing the obsolete tenant login role.
        DB::table('users')->where('role', 'tenant')->update(['role' => 'owner']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('owner', 'admin') NOT NULL DEFAULT 'owner'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('owner', 'admin', 'tenant') NOT NULL DEFAULT 'owner'");
        }
    }
};
