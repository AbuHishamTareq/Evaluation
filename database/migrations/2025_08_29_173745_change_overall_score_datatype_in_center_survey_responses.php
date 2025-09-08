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
        Schema::table("center_survey_responses", function (Blueprint $table) {
            $table->decimal('overall_score', 8, 2)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("center_survey_responses", function (Blueprint $table) {
            // Revert to original decimal(5,2) if necessary. 
            // Be aware of potential data truncation if values exceed 999.99.
            $table->decimal("overall_score", 5, 2)->change();
        });
    }
};