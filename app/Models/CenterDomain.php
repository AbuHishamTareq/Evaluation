<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class CenterDomain
 *
 * @property int $id
 * @property int $center_id
 * @property int $domain_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 *
 * @property Center $center
 * @property Domain $domain
 */
class CenterDomain extends Model
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'center_id',
        'domain_id',
    ];

    /**
     * Get the center that owns this relation.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * Get the domain that owns this relation.
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }
}
