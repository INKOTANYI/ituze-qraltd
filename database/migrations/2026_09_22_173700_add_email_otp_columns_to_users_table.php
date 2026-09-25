<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'email_otp')) {
                $table->string('email_otp', 6)->nullable()->after('email_verified_at');
            }
            if (! Schema::hasColumn('users', 'email_otp_expires_at')) {
                $table->timestamp('email_otp_expires_at')->nullable()->after('email_otp');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'email_otp')) {
                $table->dropColumn('email_otp');
            }
            if (Schema::hasColumn('users', 'email_otp_expires_at')) {
                $table->dropColumn('email_otp_expires_at');
            }
        });
    }
};
