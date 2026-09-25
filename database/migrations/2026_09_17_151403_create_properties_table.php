<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn(['district', 'sector']);
            $table->foreignId('cell_id')->nullable()->constrained()->nullOnDelete()->after('owner_id');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropForeign(['cell_id']);
            $table->dropColumn('cell_id');
            $table->string('district')->nullable();
            $table->string('sector')->nullable();
        });
    }
};