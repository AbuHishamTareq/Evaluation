<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class Medication extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'medications';

    protected $fillable = [
        'drug_name',
        'slug',
        'allocation',
        'standard_quantity',
        'section_id',
        'domain_id'
    ];

    /**
     * Auto-generate slug when setting drug_name.
     */
    public static function boot()
    {
        parent::boot();

        static::creating(function ($medication) {
            if (empty($medication->slug)) {
                $medication->slug = Str::slug($medication->drug_name);
            }
        });
    }

    /**
     * Relationship: Medication belongs to a Section
     */
    protected $casts = [
        'section_id' => 'string',
        'domain_id' => 'string',
    ];

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id', 'name');
    }
    
    public function domain()
    {
        return $this->belongsTo(Domain::class, 'domain_id', 'name');
    }
}
