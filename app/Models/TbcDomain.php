<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class TbcDomain
 *
 * Represents the relationship between a team-based code (TBC) and a domain.
 *
 * @property int $id
 * @property int $tbc_id
 * @property int $domain_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Tbc $team
 * @property Domain $domain
 */
class TbcDomain extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'tbc_id',
        'domain_id',
    ];

    /**
     * Get the team (TBC) that owns this relationship.
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Tbc::class, 'tbc_id');
    }

    /**
     * Get the domain associated with this team.
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }
}
