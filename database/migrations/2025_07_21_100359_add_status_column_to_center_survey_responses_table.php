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
        Schema::table('center_survey_responses', function (Blueprint $table) {
            $table->enum('status', ['started', 'in-progress', 'completed'])->default('started');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('center_survey_responses', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
