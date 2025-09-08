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
        Schema::create('role_survey', function (Blueprint $table) {
            $table->string('role_id');
            $table->foreign('role_id')->references('name')->on('roles')->onDelete('cascade');
            $table->string('survey_id');
            $table->foreign('survey_id')->references('name')->on('surveys')->onDelete('cascade');
            $table->primary(['role_id', 'survey_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_survey');
    }
};
