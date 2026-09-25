<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('type');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('company_name')->nullable()->after('last_name');
            $table->string('identity_type')->nullable()->after('company_name');
            $table->string('identity_number')->nullable()->after('identity_type');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name', 'company_name', 'identity_type', 'identity_number']);
        });
    }
};
