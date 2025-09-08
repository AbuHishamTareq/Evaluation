<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->string('ar_label')->unique()->after('title');
            $table->string('name')->unique()->after('ar_label');
            $table->string('section_id')->unique()->after('name');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('section_id');
            $table->foreign('section_id')->references('name')->on('sections')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveys', function (Blueprint $table) {
            $table->dropForeign(['section_id']);
            $table->dropColumn(['ar_label', 'name', 'section_id', 'status']);
        });
    }
};
