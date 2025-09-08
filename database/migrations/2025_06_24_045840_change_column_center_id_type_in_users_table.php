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
        // Step 1: Drop existing foreign key
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
        });

        // Step 2: Change column type
        Schema::table('users', function (Blueprint $table) {
            $table->string('center_id')->nullable()->change(); // or notNullable() if needed
        });

        // Step 3: Ensure centers.name is unique
        Schema::table('centers', function (Blueprint $table) {
            $table->unique('name'); // Only if not already unique
        });

        // Step 4: Re-add foreign key
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('center_id')->references('name')->on('centers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
        });

        Schema::table('centers', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('center_id')->change();
            $table->foreign('center_id')->references('id')->on('centers')->onDelete('cascade');
        });
    }
};
