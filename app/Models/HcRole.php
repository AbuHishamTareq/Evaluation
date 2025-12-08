<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class HcRole extends Model
{
    use HasFactory, HasApiTokens;
    protected $table = 'hc_roles';

    protected $fillable = [
        'en_hcRole',
        'ar_hcRole',
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
}
