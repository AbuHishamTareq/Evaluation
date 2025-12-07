<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Nationality extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'nationalities';

    protected $fillable = [
        'iso_code_3',
        'en_nationality',
        'ar_nationality',
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

    // optional: if you also want users that have this nationality (not requested but common)
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'nationality_id');
    }
}
