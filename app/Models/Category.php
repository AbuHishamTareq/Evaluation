<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class Category extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'categories';

    protected $fillable = [
        'category',
        'sector_id',
        'specialty_id',
        'rank_id',
        'created_by',
        'updated_by',
    ];

    public function sector(): BelongsTo
    {
        return $this->belongsTo(Sector::class, 'sector_id', 'id');
    }

    public function specialty(): BelongsTo
    {
        return $this->belongsTo(Specialty::class, 'specialty_id', 'id');
    }

    public function rank(): BelongsTo
    {
        return $this->belongsTo(Rank::class, 'rank_id', 'id');
    }

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
}
