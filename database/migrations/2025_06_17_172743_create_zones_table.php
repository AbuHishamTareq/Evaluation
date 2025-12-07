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
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->foreignId('elt_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            // Ensure no duplicate zone names within the same ELT
            $table->unique(['name', 'elt_id']);

            // Optional if querying by name and elt_id often
            $table->index(['elt_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};
