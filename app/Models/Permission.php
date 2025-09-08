<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    protected $fillable = [
        'name',
        'module',
        'label',
        'description',
        'is_active',
        'guard_name',
    ];

    protected $attributes = [
        'guard_name' => 'sanctum', // 👈 Make sure this matches your actual guard
    ];

    protected static function booted(): void
    {
        static::creating(function ($permission) {
            if (! $permission->guard_name) {
                $permission->guard_name = 'sanctum';
            }
        });
    }
}
