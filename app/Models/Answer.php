<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class Answer
 *
 * @property int $id
 * @property string $answer
 * @property float $score
 * @property int $question_id
 * @property int $csr_id
 * @property bool $is_draft
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Question $question
 * @property CenterSurveyResponse $response
 */
class Answer extends Model
{
    use HasFactory, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int,string>
     */
    protected $fillable = [
        'answer',
        'score',
        'question_id',
        'csr_id',
        'is_draft', // New field to track draft status
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
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
     * Scope to get answers for specific questions
     */
    public function scopeForQuestions($query, array $questionIds)
    {
        return $query->whereIn('question_id', $questionIds);
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
     * Get the question associated with the answer.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
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
     * Create or update an answer with proper draft handling
     */
    public static function createOrUpdateAnswer($responseId, $questionId, $answerText, $score = 0, $isDraft = true)
    {
        return static::updateOrCreate(
            [
                'csr_id' => $responseId,
                'question_id' => $questionId,
            ],
            [
                'answer' => $answerText,
                'score' => $score,
                'is_draft' => $isDraft,
            ]
        );
    }

    /**
     * Bulk create or update answers
     */
    public static function bulkCreateOrUpdate($responseId, array $answersData, $isDraft = true)
    {
        $results = [];
        
        foreach ($answersData as $answerData) {
            $results[] = static::createOrUpdateAnswer(
                $responseId,
                $answerData['question_id'],
                $answerData['answer'],
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
     * Get answer statistics for a response
     */
    public static function getResponseStatistics($responseId)
    {
        $totalAnswers = static::where('csr_id', $responseId)->count();
        $draftAnswers = static::where('csr_id', $responseId)->where('is_draft', true)->count();
        $finalAnswers = static::where('csr_id', $responseId)->where('is_draft', false)->count();
        $totalScore = static::where('csr_id', $responseId)->sum('score');

        return [
            'total_answers' => $totalAnswers,
            'draft_answers' => $draftAnswers,
            'final_answers' => $finalAnswers,
            'total_score' => $totalScore,
        ];
    }
}