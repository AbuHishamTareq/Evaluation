<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class SurveyDomain
 *
 * Represents the pivot between surveys and domains with ordering.
 *
 * @property int $id
 * @property int $survey_id
 * @property int $domain_id
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Survey $survey
 * @property Domain $domain
 */
class SurveyDomain extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'survey_id',
        'domain_id',
        'order',
    ];

    /**
     * Get the survey associated with this relation.
     */
    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    /**
     * Get the domain associated with this relation.
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }
}
