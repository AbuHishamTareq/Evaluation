<?php

// Database migration to ensure proper schema for enhanced functionality
// Run this migration: php artisan make:migration update_center_survey_responses_table

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
            // Ensure status column exists with proper default
            if (!Schema::hasColumn('center_survey_responses', 'status')) {
                $table->enum('status', ['started', 'in-progress', 'completed', 'ended', 'draft', 'submitted'])
                    ->default('started')
                    ->after('overall_score');
            } else {
                // Update existing status column to include new values if needed
                $table->enum('status', ['started', 'in-progress', 'completed', 'ended', 'draft', 'submitted'])
                    ->default('started')
                    ->change();
            }

            // Add index for better performance on status queries
            $table->index(['status', 'submitted_by']);
            $table->index(['center_id', 'survey_id', 'status']);
        });

        Schema::table('answers', function (Blueprint $table) {
            // Ensure proper indexes exist for performance
            $table->index(['csr_id', 'question_id']);
            $table->index('csr_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('center_survey_responses', function (Blueprint $table) {
            $table->dropIndex(['status', 'submitted_by']);
            $table->dropIndex(['center_id', 'survey_id', 'status']);
        });

        Schema::table('answers', function (Blueprint $table) {
            $table->dropIndex(['csr_id', 'question_id']);
            $table->dropIndex(['csr_id']);
        });
    }
};
