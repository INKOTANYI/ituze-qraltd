<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete()->after('id');
            $table->foreignId('cell_id')->nullable()->constrained()->nullOnDelete()->after('owner_id');
            $table->string('name')->after('cell_id');
            $table->string('address')->after('name');
            $table->text('description')->nullable()->after('address');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropForeign(['cell_id']);
            $table->dropColumn(['owner_id', 'cell_id', 'name', 'address', 'description', 'status']);
        });
    }
};