<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'label',
        'description',
        'is_active',
        'guard_name',
    ];
    
    public function surveys(): BelongsToMany
    {
        return $this->belongsToMany(Survey::class, 'role_survey', 'survey_id', 'role_id', 'name', 'name');
    }
}
