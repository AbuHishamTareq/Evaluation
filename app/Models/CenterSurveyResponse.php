<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CenterSurveyResponse extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'center_survey_responses';

    protected $fillable = [
        'center_id',
        'survey_id',
        'submitted_by',
        'submitted_at',
        'overall_score',
        'year',
        'month',
        'evaluation_version', // Added new column
        'status',
        'last_activity_at', // New field to track last user activity
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'last_activity_at' => 'datetime',
    ];

    /**
     * Available status values for survey responses
     */
    public const STATUS_STARTED = 'started';
    public const STATUS_DRAFT = 'draft';
    public const STATUS_IN_PROGRESS = 'in-progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_ENDED = 'ended';

    /**
     * Get all available status values
     */
    public static function getAvailableStatuses()
    {
        return [
            self::STATUS_STARTED,
            self::STATUS_DRAFT,
            self::STATUS_IN_PROGRESS,
            self::STATUS_COMPLETED,
            self::STATUS_SUBMITTED,
            self::STATUS_ENDED,
        ];
    }

    /**
     * Check if the survey response can be modified
     */
    public function canBeModified()
    {
        return !in_array($this->status, [
            self::STATUS_COMPLETED,
            self::STATUS_SUBMITTED,
            self::STATUS_ENDED,
        ]);
    }

    /**
     * Check if the survey response is in a draft state
     */
    public function isDraft()
    {
        return in_array($this->status, [
            self::STATUS_STARTED,
            self::STATUS_DRAFT,
            self::STATUS_IN_PROGRESS,
        ]);
    }

    /**
     * Check if the survey response is completed
     */
    public function isCompleted()
    {
        return in_array($this->status, [
            self::STATUS_COMPLETED,
            self::STATUS_SUBMITTED,
        ]);
    }

    /**
     * Update the last activity timestamp
     */
    public function updateLastActivity()
    {
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Scope to get responses that can be resumed (same month and year, not completed)
     * Now also considers evaluation_version.
     */
    public function scopeResumable($query, $centerId, $surveyId, $userId)
    {
        $now = now();
        return $query->where('center_id', $centerId)
                    ->where('survey_id', $surveyId)
                    ->where('submitted_by', $userId)
                    ->where('year', $now->year)
                    ->where('month', $now->month)
                    ->whereIn('status', [
                        self::STATUS_STARTED,
                        self::STATUS_DRAFT,
                        self::STATUS_IN_PROGRESS,
                    ])
                    ->orderByDesc('evaluation_version'); // Get the latest uncompleted version
    }

    /**
     * Scope to get expired responses that should be marked as ended
     */
    public function scopeExpired($query)
    {
        return $query->where(function ($query) {
            $query->whereYear('submitted_at', '<', now()->year)
                ->orWhere(function ($query) {
                    $query->whereYear('submitted_at', now()->year)
                        ->whereMonth('submitted_at', '<', now()->month);
                });
        })->whereNotIn('status', [self::STATUS_COMPLETED, self::STATUS_ENDED]);
    }

    /**
     * Calculate completion percentage based on answered questions
     */
    public function getCompletionPercentageAttribute()
    {
        $totalQuestions = $this->getTotalQuestionsCount();
        $answeredCount = $this->answers()->count();

        return $totalQuestions > 0 
            ? round(($answeredCount / $totalQuestions) * 100, 2) 
            : 0;
    }

    /**
     * Get total number of questions in the survey
     */
    public function getTotalQuestionsCount()
    {
        if (!$this->survey || !$this->survey->section) {
            return 0;
        }

        $totalQuestions = 0;
        $domains = $this->survey->section->domains ?? collect();

        foreach ($domains as $domain) {
            $totalQuestions += $domain->questions->count();
        }

        return $totalQuestions;
    }

    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class, 'center_id', 'name');
    }

    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class, 'survey_id', 'name');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class, 'csr_id');
    }

    /**
     * Boot method to handle model events
     */
    protected static function boot()
    {
        parent::boot();

        // Automatically update last_activity_at when the model is updated
        static::updating(function ($model) {
            if (!$model->isDirty('last_activity_at')) {
                $model->last_activity_at = now();
            }
        });

        // Set initial last_activity_at when creating
        static::creating(function ($model) {
            if (!$model->last_activity_at) {
                $model->last_activity_at = now();
            }
        });
    }
}