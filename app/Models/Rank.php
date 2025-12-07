<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class Rank extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'ranks';

    protected $fillable = [
        'en_rank',
        'ar_rank',
        'created_by',
        'updated_by',
    ];

    public function categories()
    {
        return $this->hasMany(Category::class, 'rank_id', 'id');
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
