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
        Schema::create('question_options', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('value');
            $table->float('score');
            $table->integer('order')->nullable();
            $table->tinyInteger('status')->default(1)->index();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            // Ensure no duplicate options for the same question
            $table->unique(['question_id', 'value']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('question_options');
    }
};
