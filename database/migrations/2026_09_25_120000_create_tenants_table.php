<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['individual', 'company']);
            $table->string('name');
            $table->string('registration_number')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('national_id')->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
