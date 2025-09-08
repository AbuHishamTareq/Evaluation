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
        Schema::table('zones', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign('zones_elt_id_foreign');
        });

        Schema::table('zones', function (Blueprint $table) {
            // Change the column type
            $table->string('elt_id')->change();
        });

        Schema::table('zones', function (Blueprint $table) {
            // Re-add the foreign key constraint (adjust referenced table and column!)
            $table->foreign('elt_id')->references('name')->on('elts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('zones', function (Blueprint $table) {
            $table->dropForeign(['elt_id']);
        });

        Schema::table('zones', function (Blueprint $table) {
            $table->unsignedBigInteger('elt_id')->change(); // Or the original type
        });

        Schema::table('zones', function (Blueprint $table) {
            $table->foreign('elt_id')->references('id')->on('elts')->onDelete('cascade');
        });
    }
};
