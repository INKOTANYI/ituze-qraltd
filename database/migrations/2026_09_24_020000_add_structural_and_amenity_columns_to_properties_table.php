<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->unsignedInteger('total_units')->nullable();
            $table->unsignedInteger('total_floors')->nullable();
            $table->json('amenities')->nullable();
            $table->json('proximity')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('proximity');
            $table->dropColumn('amenities');
            $table->dropColumn('total_floors');
            $table->dropColumn('total_units');
        });
    }
};
