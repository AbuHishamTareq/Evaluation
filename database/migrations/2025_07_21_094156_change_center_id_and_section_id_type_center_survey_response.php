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
            // Step 1: Drop foreign keys
            $table->dropForeign(['center_id']);
            $table->dropForeign(['survey_id']);

            // Step 2: Drop the unique composite index
            $table->dropUnique('unique_survey_response');
        });

        Schema::table('center_survey_responses', function (Blueprint $table) {
            // Step 3: Change column types to string
            $table->string('center_id')->change();
            $table->string('survey_id')->change();
        });

        Schema::table('center_survey_responses', function (Blueprint $table) {
            // Step 4: Recreate foreign keys (adjust referenced columns accordingly)
            $table->foreign('center_id')->references('name')->on('centers')->onDelete('cascade');
            $table->foreign('survey_id')->references('name')->on('surveys')->onDelete('cascade');

            // Step 5: Recreate the unique index
            $table->unique(['center_id', 'survey_id', 'year', 'month'], 'unique_survey_response');
        });
    }

    public function down(): void
    {
        Schema::table('center_survey_responses', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropForeign(['survey_id']);
            $table->dropUnique('unique_survey_response');
        });

        Schema::table('center_survey_responses', function (Blueprint $table) {
            $table->integer('center_id')->change();
            $table->integer('survey_id')->change();
        });

        Schema::table('center_survey_responses', function (Blueprint $table) {
            $table->foreign('center_id')->references('id')->on('centers')->onDelete('cascade');
            $table->foreign('survey_id')->references('id')->on('surveys')->onDelete('cascade');
            $table->unique(['center_id', 'survey_id', 'year', 'month'], 'unique_survey_response');
        });
    }
};
