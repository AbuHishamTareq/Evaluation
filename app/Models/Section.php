<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Section extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'sections';

    protected $fillable = [
        'en_label',
        'ar_label',
        'name',
        'evaluation_type',
    ];

    public function domains(): HasMany
    {
        return $this->hasMany(Domain::class, 'section_id', 'name');
    }

    /**
     * Get the evaluation that owns this section.
     * 
     * Since the foreign key is in evaluations table, the inverse is hasOne.
     */
    public function survey()
    {
        return $this->hasOne(Survey::class, 'section_id', 'name');
    }
}
