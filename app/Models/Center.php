<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Center extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'centers';

    protected $fillable = [
        'label',
        'phc_moh_code',
        'name',
        'status',
        'zone_id',
    ];

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class, 'zone_id', 'name');
    }

    public function tbcs(): HasMany
    {
        return $this->hasMany(Tbc::class, 'center_id', 'name');
    }

    public function surveyResponses(): HasMany
    {
        return $this->hasMany(CenterSurveyResponse::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    protected $casts = [
        'zone_id' => 'string',
    ];
}
