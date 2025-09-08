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
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->string('header_id');
            $table->enum('control_type', ['label', 'text', 'number', 'select', 'radio', 'rating'])->default('text');
            $table->json('options')->nullable();
            $table->timestamps();

            $table->foreign('header_id')->references('slug')->on('headers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fields');
    }
};
