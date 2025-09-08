<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    protected function indexExists(string $table, string $indexName): bool
    {
        return DB::table('information_schema.STATISTICS')
            ->where('TABLE_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', $table)
            ->where('INDEX_NAME', $indexName)
            ->exists();
    }

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('center_survey_responses', function (Blueprint $table) {
            if (! Schema::hasColumn('center_survey_responses', 'last_activity_at')) {
                $table->timestamp('last_activity_at')->nullable()->after('submitted_at');
            }
        });

        Schema::table('answers', function (Blueprint $table) {
            if (! Schema::hasColumn('answers', 'is_draft')) {
                $table->boolean('is_draft')->default(true)->after('score');
            }
        });

        if (! $this->indexExists('answers', 'answers_csr_id_is_draft_index')) {
            Schema::table('answers', function (Blueprint $table) {
                $table->index(['csr_id', 'is_draft'], 'answers_csr_id_is_draft_index');
            });
        }

        if (! $this->indexExists('answers', 'answers_question_id_csr_id_index')) {
            Schema::table('answers', function (Blueprint $table) {
                $table->index(['question_id', 'csr_id'], 'answers_question_id_csr_id_index');
            });
        }

        if (! $this->indexExists('center_survey_responses', 'resumable_surveys_index')) {
            Schema::table('center_survey_responses', function (Blueprint $table) {
                $table->index(
                    ['center_id', 'survey_id', 'submitted_by', 'year', 'month', 'status'],
                    'resumable_surveys_index'
                );
            });
        }

        if (! $this->indexExists('center_survey_responses', 'expired_surveys_index')) {
            Schema::table('center_survey_responses', function (Blueprint $table) {
                $table->index(['year', 'month', 'status'], 'expired_surveys_index');
            });
        }

        if (! $this->indexExists('center_survey_responses', 'center_survey_responses_last_activity_at_index')) {
            Schema::table('center_survey_responses', function (Blueprint $table) {
                $table->index('last_activity_at', 'center_survey_responses_last_activity_at_index');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {

        Schema::table('center_survey_responses', function (Blueprint $table) {
            try { $table->dropIndex('resumable_surveys_index'); } catch (\Throwable $e) {}
            try { $table->dropIndex('expired_surveys_index'); } catch (\Throwable $e) {}
            try { $table->dropIndex('center_survey_responses_last_activity_at_index'); } catch (\Throwable $e) {}
        });

        Schema::table('answers', function (Blueprint $table) {
            try { $table->dropIndex('answers_csr_id_is_draft_index'); } catch (\Throwable $e) {}
            try { $table->dropIndex('answers_question_id_csr_id_index'); } catch (\Throwable $e) {}
            if (Schema::hasColumn('answers', 'is_draft')) {
                $table->dropColumn('is_draft');
            }
        });

        Schema::table('center_survey_responses', function (Blueprint $table) {
            if (Schema::hasColumn('center_survey_responses', 'last_activity_at')) {
                $table->dropColumn('last_activity_at');
            }
        });
    }
};
