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
        Schema::table('centers', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign('centers_zone_id_foreign');
        });

        Schema::table('centers', function (Blueprint $table) {
            // Change the column type
            $table->string('zone_id')->change();
        });

        Schema::table('centers', function (Blueprint $table) {
            // Re-add the foreign key constraint (adjust referenced table and column!)
            $table->foreign('zone_id')->references('name')->on('zones')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('centers', function (Blueprint $table) {
            $table->dropForeign(['zone_id']);
        });

        Schema::table('centers', function (Blueprint $table) {
            $table->unsignedBigInteger('zone_id')->change(); // Or the original type
        });

        Schema::table('centers', function (Blueprint $table) {
            $table->foreign('zone_id')->references('id')->on('zones')->onDelete('cascade');
        });
    }
};
