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
            // Drop the existing unique constraint using the actual index name
            $table->dropUnique('unique_survey_response');

            // Add the new evaluation_version column
            $table->unsignedInteger("evaluation_version")->default(1)->after("month");

            // Add a new unique constraint including evaluation_version
            $table->unique(
                ["center_id", "survey_id", "submitted_by", "year", "month", "evaluation_version"],
                "unique_survey_evaluation"
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table("center_survey_responses", function (Blueprint $table) {
            // Drop the new unique constraint
            $table->dropUnique('unique_survey_evaluation');

            // Remove the evaluation_version column
            $table->dropColumn("evaluation_version");

            // Re-add the old unique constraint
            $table->unique(
                ["center_id", "survey_id", "submitted_by", "year", "month"],
                "unique_survey_response"
            );
        });
    }
};