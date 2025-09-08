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
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->text('answer');
            $table->float('score');
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->foreignId('csr_id')->constrained('center_survey_responses')->cascadeOnDelete();
            $table->timestamps();

            // Composite index for efficient querying by question and survey response
            $table->index(['question_id', 'csr_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
