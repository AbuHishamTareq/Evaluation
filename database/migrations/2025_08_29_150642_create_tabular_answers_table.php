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
        Schema::create('tabular_answers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('csr_id'); // Center Survey Response ID
            $table->string('question_key'); // e.g., "med_1_field_4", "1_4"
            $table->text('answer_value'); // The actual answer
            $table->decimal('score', 8, 2)->default(0); // Score for this answer
            $table->boolean('is_draft')->default(true); // Draft status
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('csr_id')->references('id')->on('center_survey_responses')->onDelete('cascade');
            
            // Indexes for better performance
            $table->index(['csr_id', 'is_draft']);
            $table->index('question_key');
            
            // Unique constraint to prevent duplicate answers for the same question
            $table->unique(['csr_id', 'question_key', 'is_draft']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tabular_answers');
    }
};