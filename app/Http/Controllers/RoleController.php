<?php

namespace App\Http\Controllers;

use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function roles(Request $request)
    {
        // Get request parameters
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        // Sorting
        $sortBy = $request->input('sort_by', 'id'); // default: sort by id
        $sortDir = in_array(strtolower($request->input('sort_dir', 'asc')), ['asc', 'desc'])
            ? $request->input('sort_dir', 'asc')
            : 'asc';

        // Search
        $search = $request->input('search', null);

        // Build query
        $roleQuery = Role::with('permissions')->latest();

        // Apply search filter
        if ($search) {
            $roleQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('label', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $roles = $roleQuery
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage, ['*'], 'page', $page);

        // Transform with RoleResource
        $rolesResource = RoleResource::collection($roles);
        $rolesData = $rolesResource->response()->getData(true);
        $rolesData['data'] = $rolesResource->toArray($request);

        // Fetch permissions grouped by module
        $permissions = Permission::get()->groupBy('module');

        return response()->json([
            'roles' => $rolesData,
            'permissions' => $permissions,
        ]);
    }

    public function create(RoleRequest $request)
    {
        $role = $request->validated();

        $savedRole = Role::create([
            'label' => $role['label'],
            'name' => Str::slug($role['label']),
            'description' => $role['description']
        ]);

        if (!$savedRole) {
            return response()->json([
                'error' => 'Unable to create role. Please try again !'
            ], 500);
        }

        $savedRole->syncPermissions($role['permissions']);

        return response()->json([
            'message' => 'role created Successfully !'
        ], 200);
    }

    public function edit(RoleRequest $request, Role $role)
    {
        if ($role) {
            $role->label = $request->input('label');
            $role->description = $request->input('description');
            $role->save();

            // FIX: get permissions from the request
            $role->syncPermissions($request->input('permissions'));

            return response()->json([
                'message' => 'Role updated successfully!',
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update role. Please try again!',
        ], 500);
    }

    public function destroy(Role $role)
    {
        if (!$role) {
            return response()->json([
                'error' => 'role not found.'
            ], 404);
        }

        try {
            Role::withoutEvents(function () use ($role) {
                $role->delete();
            });
            return response()->json([
                'message' => 'role deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete role. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }
}
