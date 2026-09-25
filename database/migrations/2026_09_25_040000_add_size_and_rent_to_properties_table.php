<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->decimal('size_sqm', 12, 2)->nullable()->after('total_floors');
            $table->decimal('rent_amount', 12, 2)->nullable()->after('size_sqm');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['size_sqm', 'rent_amount']);
        });
    }
};
