<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('property_inquiries', function (Blueprint $table) {
            $table->timestamp('responded_at')->nullable()->after('status');
            $table->index(['owner_id', 'visitor_email', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('property_inquiries', function (Blueprint $table) {
            $table->dropIndex(['owner_id', 'visitor_email', 'status']);
            $table->dropColumn('responded_at');
        });
    }
};
