<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('property_inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('visitor_name');
            $table->string('visitor_email')->nullable();
            $table->string('visitor_phone', 40)->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'read', 'replied'])->default('new');
            $table->timestamp('whatsapp_sent_at')->nullable();
            $table->text('whatsapp_error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_inquiries');
    }
};
