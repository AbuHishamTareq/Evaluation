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
        Schema::table('questions', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign('1');
        });

        Schema::table('questions', function (Blueprint $table) {
            // Change the column type
            $table->string('domain_id')->change()->nullable()->index();
        });

        Schema::table('questions', function (Blueprint $table) {
            // Re-add the foreign key constraint (adjust referenced table and column!)
            $table->foreign('domain_id')->references('name')->on('domains')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::table('questions', function (Blueprint $table) {
            $table->dropForeign(['domain_id']);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->unsignedBigInteger('domain_id')->change()->nullable(); // Or the original type
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->foreign('domain_id')->references('id')->on('domains')->onDelete('cascade');
        });
    }
};
