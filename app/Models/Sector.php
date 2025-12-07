<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Sector extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'sectors';

    protected $fillable = [
        'en_sector',
        'ar_sector',
        'created_by',
        'updated_by',
    ];

    // creator (the user who created this nationality)
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // updater (the user who last updated this nationality)
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function specialties(): HasMany
    {
        return $this->hasMany(Specialty::class, 'sector_id', 'id');
    }

    public function ranks(): HasMany
    {
        return $this->hasMany(Rank::class, 'sector_id', 'id');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class, 'sector_id', 'id');
    }
}
