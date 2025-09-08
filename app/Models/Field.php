<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Field extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'fields';

    protected $fillable = [
        'header_id',
        'control_type',
        'options',
    ];

    protected $casts = [
        'options' => 'array',
    ];

    public function header()
    {
        return $this->belongsTo(Header::class, 'header_id', 'slug');
    }
}
