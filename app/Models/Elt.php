<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class ELT
 *
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property \Illuminate\Database\Eloquent\Collection|Zone[] $zones
 */
class ELT extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'elts';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int,string>
     */
    protected $fillable = [
        'label',
        'name',
    ];

    /**
     * Get the zones associated with this ELT.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
    }
}
