<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Tbc
 *
 * Represents a team-based code (TBC) associated with a center and domains.
 *
 * @property int $id
 * @property string $code
 * @property int $center_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Center $center
 * @property \Illuminate\Database\Eloquent\Collection|TbcDomain[] $domains
 */
class Tbc extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'tbcs';

    protected $fillable = [
        'code',
        'name',
        'center_id',
    ];

    protected $casts = [
        'center_id' => 'string',
    ];

    /**
     * Get the center that owns this TBC.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class, 'center_id', 'name');
    }

    /**
     * Get the domains related to this TBC (team-based code).
     */
    public function domains(): HasMany
    {
        return $this->hasMany(TbcDomain::class, 'tbc_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'tbc', 'name');
    }
}
