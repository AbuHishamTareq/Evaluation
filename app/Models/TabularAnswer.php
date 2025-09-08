<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class TabularAnswer
 *
 * @property int $id
 * @property int $csr_id
 * @property string $question_key
 * @property string $answer_value
 * @property float $score
 * @property bool $is_draft
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property CenterSurveyResponse $response
 */
class TabularAnswer extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'tabular_answers';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'csr_id',
        'question_key',
        'answer_value',
        'score',
        'is_draft',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'score' => 'float',
        'is_draft' => 'boolean',
    ];

    /**
     * Scope to get only draft answers
     */
    public function scopeDrafts($query)
    {
        return $query->where('is_draft', true);
    }

    /**
     * Scope to get only final (non-draft) answers
     */
    public function scopeFinal($query)
    {
        return $query->where('is_draft', false);
    }

    /**
     * Scope to get answers for a specific survey response
     */
    public function scopeForResponse($query, $responseId)
    {
        return $query->where('csr_id', $responseId);
    }

    /**
     * Scope to get answers for specific question keys
     */
    public function scopeForQuestionKeys($query, array $questionKeys)
    {
        return $query->whereIn('question_key', $questionKeys);
    }

    /**
     * Scope to get medication-related answers
     */
    public function scopeMedicationAnswers($query)
    {
        return $query->where('question_key', 'like', 'med_%_field_%');
    }

    /**
     * Scope to get simple tabular answers (format: X_Y)
     */
    public function scopeSimpleTabularAnswers($query)
    {
        return $query->whereRaw('question_key REGEXP "^[0-9]+_[0-9]+$"');
    }

    /**
     * Mark this answer as final (not a draft)
     */
    public function markAsFinal()
    {
        $this->update(['is_draft' => false]);
    }

    /**
     * Mark this answer as draft
     */
    public function markAsDraft()
    {
        $this->update(['is_draft' => true]);
    }

    /**
     * Check if this answer is a draft
     */
    public function isDraft()
    {
        return $this->is_draft;
    }

    /**
     * Get the center survey response this answer belongs to.
     */
    public function response(): BelongsTo
    {
        return $this->belongsTo(CenterSurveyResponse::class, 'csr_id');
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Set default is_draft value when creating
        static::creating(function ($model) {
            if (!isset($model->is_draft)) {
                $model->is_draft = true; // Default to draft
            }
        });

        // Update the parent response's last activity when answer is modified
        static::saved(function ($model) {
            if ($model->response) {
                $model->response->updateLastActivity();
            }
        });

        static::deleted(function ($model) {
            if ($model->response) {
                $model->response->updateLastActivity();
            }
        });
    }

    /**
     * Create or update a tabular answer
     */
    public static function createOrUpdateTabularAnswer($responseId, $questionKey, $answerValue, $score = 0, $isDraft = true)
    {
        return static::updateOrCreate(
            [
                'csr_id' => $responseId,
                'question_key' => $questionKey,
                'is_draft' => $isDraft,
            ],
            [
                'answer_value' => $answerValue,
                'score' => $score,
            ]
        );
    }

    /**
     * Bulk create or update tabular answers
     */
    public static function bulkCreateOrUpdate($responseId, array $answersData, $isDraft = true)
    {
        $results = [];
        
        foreach ($answersData as $answerData) {
            $results[] = static::createOrUpdateTabularAnswer(
                $responseId,
                $answerData['question_key'],
                $answerData['answer_value'],
                $answerData['score'] ?? 0,
                $isDraft
            );
        }

        return $results;
    }

    /**
     * Convert all draft answers for a response to final answers
     */
    public static function finalizeDraftsForResponse($responseId)
    {
        return static::where('csr_id', $responseId)
                    ->where('is_draft', true)
                    ->update(['is_draft' => false]);
    }

    /**
     * Delete all draft answers for a response
     */
    public static function clearDraftsForResponse($responseId)
    {
        return static::where('csr_id', $responseId)
                    ->where('is_draft', true)
                    ->delete();
    }

    /**
     * Get tabular answer statistics for a response
     */
    public static function getResponseStatistics($responseId)
    {
        $totalAnswers = static::where('csr_id', $responseId)->count();
        $draftAnswers = static::where('csr_id', $responseId)->where('is_draft', true)->count();
        $finalAnswers = static::where('csr_id', $responseId)->where('is_draft', false)->count();
        $totalScore = static::where('csr_id', $responseId)->sum('score');

        return [
            'total_tabular_answers' => $totalAnswers,
            'draft_tabular_answers' => $draftAnswers,
            'final_tabular_answers' => $finalAnswers,
            'total_tabular_score' => $totalScore,
        ];
    }

    /**
     * Get medication data grouped by medication ID
     */
    public static function getMedicationDataForResponse($responseId, $isDraft = false)
    {
        $answers = static::where('csr_id', $responseId)
                         ->where('is_draft', $isDraft)
                         ->medicationAnswers()
                         ->get();

        $medicationData = [];
        
        foreach ($answers as $answer) {
            // Parse question_key: med_1_field_4 -> medication_id = 1, field_id = 4
            if (preg_match('/^med_(\d+)_field_(\d+)$/', $answer->question_key, $matches)) {
                $medicationId = (int) $matches[1];
                $fieldId = (int) $matches[2];
                
                if (!isset($medicationData[$medicationId])) {
                    $medicationData[$medicationId] = [];
                }
                
                $medicationData[$medicationId][$fieldId] = $answer->answer_value;
            }
        }

        return $medicationData;
    }

    /**
     * Get simple tabular data for response
     */
    public static function getSimpleTabularDataForResponse($responseId, $isDraft = false)
    {
        return static::where('csr_id', $responseId)
                    ->where('is_draft', $isDraft)
                    ->simpleTabularAnswers()
                    ->get()
                    ->mapWithKeys(function ($answer) {
                        return [$answer->question_key => $answer->answer_value];
                    });
    }
}