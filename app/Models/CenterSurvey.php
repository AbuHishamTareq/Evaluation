<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class CenterSurvey
 *
 * @property int $id
 * @property int $center_id
 * @property int $survey_id
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Center $center
 * @property Survey $survey
 */
class CenterSurvey extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'center_id',
        'survey_id',
        'status',
    ];

    /**
     * Get the center that owns the survey.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * Get the survey assigned to the center.
     */
    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }
}
