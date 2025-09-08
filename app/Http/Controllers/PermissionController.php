<?php

namespace App\Http\Controllers;

use App\Http\Requests\PermissionRequest;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PermissionController extends Controller
{
    public function permissions(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at'); // default sort column
        $sortDir = $request->input('sort_dir', 'desc');     // default sort direction

        $allowedSortFields = ['id', 'name', 'label', 'module', 'description', 'created_at'];

        $query = Permission::query();

        // Optional search across multiple fields
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('label', 'like', "%{$search}%")
                    ->orWhere('module', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Validate and apply sorting
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest(); // fallback if invalid column
        }

        $permissions = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection for frontend
        $permissions->getCollection()->transform(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'label' => $permission->label,
                'module' => $permission->module,
                'description' => $permission->description,
                'created_at' => $permission->created_at->format('d M Y'),
            ];
        });

        return response()->json($permissions);
    }

    public function create(PermissionRequest $request)
    {
        $permission = $request->validated();

        $savedPermission = Permission::create([
            'module' => $permission['module'],
            'label' => $permission['label'],
            'name' => Str::slug($permission['label']),
            'description' => $permission['description']
        ]);

        if (!$savedPermission) {
            return response()->json([
                'error' => 'Unable to create Permission. Please try again !'
            ], 500);
        }

        return response()->json([
            'message' => 'Permission created Successfully !'
        ], 200);
    }

    public function edit(PermissionRequest $request, $id)
    {
        $validated = $request->validated();

        $permission = Permission::findOrFail($id);

        $updated = $permission->update([
            'module' => $validated['module'],
            'label' => $validated['label'],
            'description' => $validated['description'],
        ]);

        if (!$updated) {
            return response()->json([
                'error' => 'Unable to update Permission. Please try again!'
            ], 500);
        }

        return response()->json([
            'message' => 'Permission updated successfully!',
        ], 200);
    }

    public function destroy(Permission $permission)
    {
        if (!$permission) {
            return response()->json([
                'error' => 'Permission not found.'
            ], 404);
        }

        try {
            Permission::withoutEvents(function () use ($permission) {
                $permission->delete();
            });
            return response()->json([
                'message' => 'Permission deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete permission. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }
}
