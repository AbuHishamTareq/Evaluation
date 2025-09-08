<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class Header extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'headers';

    protected $fillable = [
        'header_en',
        'header_ar',
        'slug',
        'section_id',
        'order',
    ];

    protected $casts = [
        'section_id' => 'string',
    ];

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id', 'name');
    }

    public function fields()
    {
        return $this->hasMany(Field::class, 'header_id', 'slug');
    }

    protected static function boot()
    {
        parent::boot();

        // Generate slug when creating
        static::creating(function ($header) {
            if (empty($header->slug)) {
                $header->slug = Str::slug($header->header_en);
            }
        });
    }
}
