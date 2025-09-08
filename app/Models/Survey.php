<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\URL;

class Survey extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'surveys';
    protected $appends = ['image_url'];

    protected $fillable = [
        'title', // Add other survey fields if needed
        'ar_label',
        'en_description',
        'ar_description',
        'name',
        'section_id',
        'status',
        'created_by',
        'image',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id', 'name');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_survey', 'survey_id', 'role_id', 'name', 'name');
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return URL::to($this->image); // Generates full URL like http://yourdomain.com/images/xxx.png
        }

        return null;
    }
}
