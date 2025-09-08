<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class Zone extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'zones';

    protected $fillable = [
        'label',
        'name',
        'elt_id',
    ];

    public function elt(): BelongsTo
    {
        return $this->belongsTo(ELT::class, 'elt_id', 'name');
    }

    protected $casts = [
        'elt_id' => 'string',
    ];
}
