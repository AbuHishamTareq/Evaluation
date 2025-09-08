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
            $table->dropColumn('question');
            $table->string('en_label', 1024)->after('id');
            $table->string('ar_label', 1024)->after('en_label');
            $table->string('name', 1024)->after('ar_label');
            $table->longText('data')->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->string('question', 1024)->after('id');
            $table->dropColumn('en_label');
            $table->dropColumn('ar_label');
            $table->dropColumn('name');
            $table->dropColumn('data');
        });
    }
};
