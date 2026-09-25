<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->unique()->nullable()->after('email');
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->enum('role', ['owner', 'admin'])->default('owner')->after('phone_verified_at');
            $table->string('national_id')->nullable()->after('role');
            $table->string('profile_photo')->nullable()->after('national_id');
            $table->boolean('profile_completed')->default(false)->after('profile_photo');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('profile_completed');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn([
                'phone',
                'phone_verified_at',
                'role',
                'national_id',
                'profile_photo',
                'profile_completed',
                'created_by',
            ]);
        });
    }
};