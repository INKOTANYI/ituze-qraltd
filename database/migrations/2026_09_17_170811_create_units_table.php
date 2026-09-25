<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_type_id')->constrained()->restrictOnDelete();
            $table->string('unit_number');
            $table->decimal('rent_amount', 12, 2);
            $table->text('description')->nullable();
            $table->enum('status', ['vacant', 'occupied', 'maintenance'])->default('vacant');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};