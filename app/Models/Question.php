<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Question
 *
 * @property int $id
 * @property string $question
 * @property string $type
 * @property bool $required
 * @property int|null $order
 * @property int $domain_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Domain $domain
 * @property \Illuminate\Database\Eloquent\Collection|QuestionOption[] $options
 * @property \Illuminate\Database\Eloquent\Collection|Answer[] $answers
 */
class Question extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'en_label',
        'en_extra_label',
        'ar_label',
        'ar_extra_label',
        'name',
        'data',
        'type',
        'required', 'order',
        'domain_id',
    ];

    /**
     * The domain this question belongs to.
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class, 'domain_id', 'name');
    }

    /**
     * The possible options for this question (if applicable).
     */
    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class);
    }

    /**
     * The answers submitted for this question.
     */
    public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }
}
