<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Imports\UserImport;
use App\Models\Center;
use App\Models\Role;
use App\Models\Tbc;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class UserController extends Controller
{
    public function users(Request $request)
    {
        // Pagination & Sort/Search Parameters
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $sortBy = $request->input('sort_by', 'id');
        $sortDir = in_array(strtolower($request->input('sort_dir', 'asc')), ['asc', 'desc'])
            ? $request->input('sort_dir')
            : 'asc';
        $search = $request->input('search');

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        // Get authenticated user
        $authUser = Auth::user();
        $authUserRole = $authUser->roles->first()?->name;

        // Build query with joins
        $userQuery = User::query()
            ->leftJoin('model_has_roles', function ($join) {
                $join->on('users.id', '=', 'model_has_roles.model_id')
                    ->where('model_has_roles.model_type', '=', User::class);
            })
            ->leftJoin('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->leftJoin('centers', 'users.center_id', '=', 'centers.name')
            ->leftJoin('tbcs', 'users.tbc', '=', 'tbcs.name')
            ->select(
                'users.*',
                'roles.name as role_name',
                'roles.label as role_label',
                'centers.label as center_label',
                'centers.name as center_name',
                'tbcs.code as tbc'
            )
            ->distinct('users.id');

        // **New: Filter by user's center_id if present**
        if ($authUser->center_id) {
            // User is scoped to center, so show only users in same center
            $userQuery->where('users.center_id', $authUser->center_id);
        }

        // Role-based filtering
        if ($authUserRole === 'admin') {
            $userQuery->where('roles.name', '!=', 'super-admin');
        } elseif ($authUserRole !== 'super-admin') {
            $userQuery->whereNotIn('roles.name', ['super-admin', 'admin']);
        }

        // Search filter
        if ($search) {
            $searchTerm = "%{$search}%";
            $userQuery->where(function ($query) use ($searchTerm) {
                $query->where('users.name', 'like', $searchTerm)
                    ->orWhere('users.email', 'like', $searchTerm)
                    ->orWhere('roles.name', 'like', $searchTerm)
                    ->orWhere('centers.label', 'like', $searchTerm)
                    ->orWhere('tbcs.code', 'like', $searchTerm);
            });
        }

        // Sorting
        $allowedSortColumns = [
            'id' => 'users.id',
            'name' => 'users.name',
            'email' => 'users.email',
            'created_at' => 'users.created_at',
            'center' => 'centers.label',
        ];

        $sortColumn = $allowedSortColumns[$sortBy] ?? 'users.id';
        $userQuery->orderBy($sortColumn, $sortDir);

        // Paginate
        $users = $userQuery->paginate($perPage, ['*'], 'page', $page);

        // Format data
        $users->getCollection()->transform(function ($user) {
            // For roles, always return an array containing the role object
            $userRoles = [];
            if ($user->role_name) { // Check if role data exists
                $userRoles[] = [
                    'name' => $user->role_name,
                    'label' => $user->role_label,
                ];
            }

            // For centers, return an array containing the center object if it exists, otherwise an empty array
            $userCenters = [];
            if ($user->center_name) { // Check if center data exists
                $userCenters[] = [
                    'label' => $user->center_label,
                    'name' => $user->center_name
                ];
            }

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $userRoles, // This will now always be an array
                'centers' => $userCenters, // This will now always be an array
                'status' => $user->status,
                'created_at' => $user->created_at?->format('d M Y'),
                'mobile' => $user->mobile,
                'tbc' => $user->tbc,
            ];
        });

        // Load roles list
        $roleQuery = Role::query();
        if ($authUserRole === 'admin') {
            $roleQuery->where('name', '!=', 'super-admin');
        } elseif ($authUserRole !== 'super-admin') {
            $roleQuery->whereNotIn('name', ['super-admin', 'admin']);
        }

        $roles = $roleQuery->get();
        $centers = Center::get();

        return response()->json([
            'users' => $users,
            'roles' => $roles,
            'centers' => $centers,
        ]);
    }

    public function create(UserRequest $request)
    {
        $authUser = Auth::user();

        // Only override center_id if the user is scoped to a specific center
        if (!empty($authUser->center_id)) {
            $request->merge([
                'center' => $authUser->center_id,
            ]);
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'center_id' => $request->input('center') ?? null, // from merged value or frontend
            'mobile' => $request->input('mobile'),
        ]);

        if ($user) {
            $user->syncRoles($request->input('role', [])); // or `roles`, based on your frontend key

            return response()->json([
                'message' => 'User created Successfully!'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create user. Please try again!',
        ], 500);
    }


    public function edit(UserRequest $request, User $user)
    {
        if ($user) {
            $user->name = $request->input('name');
            $user->email = $request->input('email');
            $user->center_id = $request->input('center');
            $user->mobile = $request->input('mobile');
            $user->save();

            $user->syncRoles($request->input('role', []));

            return response()->json([
                'message' => 'User updated Successfully!'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update user. Please try again!',
        ], 500);
    }

    public function destroy(User $user)
    {
        if (!$user) {
            return response()->json([
                'error' => 'User not found.'
            ], 404);
        }

        try {
            User::withoutEvents(function () use ($user) {
                $user->delete();
            });
            return response()->json([
                'message' => 'User deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete user. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function status(Request $request, User $user)
    {
        if ($user) {
            $user->status = $request->input('status');
            $user->save();

            return response()->json([
                'message' => 'User updated Successfully!'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update user. Please try again!',
        ], 500);
    }

    /**
     * Bulk activate users
     */
    public function bulkActivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid user IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $userIds = $request->input('user_ids');
        $authUser = Auth::user();
        $authUserRole = $authUser->roles->first()?->name;

        try {
            // Build query with role-based filtering
            $userQuery = User::whereIn('id', $userIds);

            // Apply center filtering if user is scoped to a center
            if ($authUser->center_id) {
                $userQuery->where('center_id', $authUser->center_id);
            }

            // Apply role-based filtering to prevent unauthorized access
            if ($authUserRole === 'admin') {
                $userQuery->whereHas('roles', function ($query) {
                    $query->where('name', '!=', 'super-admin');
                });
            } elseif ($authUserRole !== 'super-admin') {
                $userQuery->whereHas('roles', function ($query) {
                    $query->whereNotIn('name', ['super-admin', 'admin']);
                });
            }

            $updatedCount = $userQuery->update(['status' => 'active']);

            return response()->json([
                'message' => "Successfully activated {$updatedCount} user(s).",
                'updated_count' => $updatedCount
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to activate users. Please try again later.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk deactivate users
     */
    public function bulkDeactivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid user IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $userIds = $request->input('user_ids');
        $authUser = Auth::user();
        $authUserRole = $authUser->roles->first()?->name;

        try {
            // Build query with role-based filtering
            $userQuery = User::whereIn('id', $userIds);

            // Apply center filtering if user is scoped to a center
            if ($authUser->center_id) {
                $userQuery->where('center_id', $authUser->center_id);
            }

            // Apply role-based filtering to prevent unauthorized access
            if ($authUserRole === 'admin') {
                $userQuery->whereHas('roles', function ($query) {
                    $query->where('name', '!=', 'super-admin');
                });
            } elseif ($authUserRole !== 'super-admin') {
                $userQuery->whereHas('roles', function ($query) {
                    $query->whereNotIn('name', ['super-admin', 'admin']);
                });
            }

            $updatedCount = $userQuery->update(['status' => 'inactive']);

            return response()->json([
                'message' => "Successfully deactivated {$updatedCount} user(s).",
                'updated_count' => $updatedCount
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to deactivate users. Please try again later.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import users from CSV/Excel file
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid file. Please upload a CSV or Excel file (max 10MB).',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $import = new UserImport();

            // Import the file
            Excel::import($import, $file);

            // Get import statistics
            $stats = $import->getImportStats();

            // Get validation failures if any
            $failures = $import->failures();
            $errors = $import->errors();

            $response = [
                'message' => 'Import completed successfully!',
                'stats' => $stats,
                'imported_count' => $stats['imported'],
                'skipped_count' => $stats['skipped'],
                'total_processed' => $stats['total_processed']
            ];

            // Add errors if any
            if (!empty($errors) || !empty($failures)) {
                $response['warnings'] = [];

                // Add custom errors
                if (!empty($stats['errors'])) {
                    $response['warnings'] = array_merge($response['warnings'], $stats['errors']);
                }

                // Add validation failures
                foreach ($failures as $failure) {
                    $response['warnings'][] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
                }
            }

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to import users. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function assignTbc(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'tbc_code' => 'required|string|exists:tbcs,code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid TBC code provided.',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $user->tbc = $request->input('tbc_code');
            $user->save();

            return response()->json([
                'message' => 'TBC assigned successfully to user.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to assign TBC. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get TBCs by center ID
     */
    public function getTbcsByCenter(Request $request, $center_id)
    {
        $validator = Validator::make(["center_id" => $center_id], [
            'center_id' => 'required|string|exists:centers,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid center ID provided.',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $tbcs = Tbc::where('center_id', $center_id)->get();

            return response()->json([
                'tbcs' => $tbcs,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve TBCs. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download sample import template
     */
    public function downloadTemplate()
    {
        try {
            $centers = Center::select('name', 'label')->get();
            $roles = Role::select('name')->get();

            $sampleData = [
                [
                    'name' => 'John Doe',
                    'email' => 'john.doe@example.com',
                    'password' => 'password123',
                    'center_id' => $centers->first()->name ?? 'center1',
                    'mobile' => '+1234567890',
                    'roles' => $roles->first()->name ?? 'user'
                ],
                [
                    'name' => 'Jane Smith',
                    'email' => 'jane.smith@example.com',
                    'password' => 'password123',
                    'center_id' => '',
                    'mobile' => '',
                    'roles' => 'admin,user'
                ]
            ];

            $export = new class($sampleData, $centers, $roles) implements
                \Maatwebsite\Excel\Concerns\FromArray,
                \Maatwebsite\Excel\Concerns\WithHeadings,
                \Maatwebsite\Excel\Concerns\WithMultipleSheets
            {
                private $sampleData;
                private $centers;
                private $roles;

                public function __construct($sampleData, $centers, $roles)
                {
                    $this->sampleData = $sampleData;
                    $this->centers = $centers;
                    $this->roles = $roles;
                }

                public function array(): array
                {
                    return $this->sampleData;
                }

                public function headings(): array
                {
                    return ['name', 'email', 'password', 'center_id', 'mobile', 'roles'];
                }

                public function sheets(): array
                {
                    return [
                        'Users' => $this,
                        'Available Centers' => new class($this->centers) implements
                            \Maatwebsite\Excel\Concerns\FromCollection,
                            \Maatwebsite\Excel\Concerns\WithHeadings
                        {
                            private $centers;

                            public function __construct($centers)
                            {
                                $this->centers = $centers;
                            }

                            public function collection()
                            {
                                return $this->centers;
                            }

                            public function headings(): array
                            {
                                return ['Center ID', 'Center Name'];
                            }
                        },
                        'Available Roles' => new class($this->roles) implements
                            \Maatwebsite\Excel\Concerns\FromCollection,
                            \Maatwebsite\Excel\Concerns\WithHeadings
                        {
                            private $roles;

                            public function __construct($roles)
                            {
                                $this->roles = $roles;
                            }

                            public function collection()
                            {
                                return $this->roles;
                            }

                            public function headings(): array
                            {
                                return ['Role Name'];
                            }
                        }
                    ];
                }
            };

            return Excel::download($export, 'users_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
