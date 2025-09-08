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
        Schema::table('tbcs', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign('tbcs_center_id_foreign');
        });

        Schema::table('tbcs', function (Blueprint $table) {
            // Change the column type
            $table->string('center_id')->change()->nullable();
        });

        Schema::table('tbcs', function (Blueprint $table) {
            // Re-add the foreign key constraint (adjust referenced table and column!)
            $table->foreign('center_id')->references('name')->on('centers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbcs', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
        });

        Schema::table('tbcs', function (Blueprint $table) {
            $table->unsignedBigInteger('center_id')->change()->nullable(); // Or the original type
        });

        Schema::table('tbcs', function (Blueprint $table) {
            $table->foreign('center_id')->references('id')->on('centers')->onDelete('cascade');
        });
    }
};
