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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->string('question', 1024);
            $table->enum('type', ['text', 'number', 'select', 'rating', 'boolean', 'textarea', 'radio', 'email'])->default('text');
            $table->boolean('required')->default(false);
            $table->integer('order')->nullable()->index();
            $table->foreignId('domain_id')->constrained()->cascadeOnDelete()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
