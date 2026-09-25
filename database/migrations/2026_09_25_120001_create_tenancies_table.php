<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenancies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained()->restrictOnDelete();
            $table->foreignId('assigned_by')->constrained('users')->restrictOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->decimal('monthly_rent', 12, 2);
            $table->decimal('deposit_amount', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['active', 'ended', 'cancelled'])->default('active');
            $table->timestamps();

            $table->index(['unit_id', 'status']);
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenancies');
    }
};
