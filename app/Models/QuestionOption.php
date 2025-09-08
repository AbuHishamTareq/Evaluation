<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class QuestionOption
 *
 * @property int $id
 * @property string $label
 * @property string $value
 * @property float $score
 * @property string|null $order
 * @property int $status
 * @property int $question_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Question $question
 */
class QuestionOption extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'label',
        'value',
        'score',
        'order',
        'status',
        'question_id',
    ];

    /**
     * The question this option belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
