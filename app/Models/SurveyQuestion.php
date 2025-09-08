<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class SurveyQuestion
 *
 * Represents the pivot between surveys and questions with potential ordering or grouping.
 *
 * @property int $id
 * @property int $survey_id
 * @property int $question_id
 * @property int|null $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Survey $survey
 * @property Question $question
 */
class SurveyQuestion extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'survey_id',
        'question_id',
    ];

    /**
     * Get the survey this question belongs to.
     */
    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    /**
     * Get the question associated with this survey.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
