<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Domain
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property \Illuminate\Database\Eloquent\Collection|Question[] $questions
 * @property \Illuminate\Database\Eloquent\Collection|TbcDomain[] $tbcDomains
 * @property \Illuminate\Database\Eloquent\Collection|CenterDomain[] $centerDomains
 * @property \Illuminate\Database\Eloquent\Collection|SurveyDomain[] $surveyDomains
 */
class Domain extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'domains';

    protected $fillable = [
        'en_label',
        'ar_label',
        'name',
        'section_id',
        'status',
    ];

    /**
     * Questions associated with this domain.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'domain_id', 'name');
    }

    /**
     * TBC domain associations (many-to-many via pivot or direct).
     */
    public function tbcDomains(): HasMany
    {
        return $this->hasMany(TbcDomain::class);
    }

    /**
     * Center domain associations.
     */
    public function centerDomains(): HasMany
    {
        return $this->hasMany(CenterDomain::class);
    }

    /**
     * Survey domain associations.
     */
    public function surveyDomains(): HasMany
    {
        return $this->hasMany(SurveyDomain::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id', 'name');
    }
}
