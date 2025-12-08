<?php

namespace App\Http\Controllers;

use App\Http\Requests\TbcRoleRequest;
use App\Imports\TbcRoleImport;
use App\Models\TbcRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class TbcRoleController extends Controller
{
    public function tbcRoles(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'tbc_roles.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'tbc_roles.id',
            'en_role' => 'tbc_roles.en_role',
            'ar_role' => 'tbc_roles.ar_role',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'tbc_roles.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = TbcRole::query();

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('tbc_roles.en_role', 'like', "%{$search}%")
                    ->orWhere('tbc_roles.ar_role', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $tbcRoles = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $tbcRoles->getCollection()->transform(function ($tbcRole) {
            return [
                'id' => $tbcRole->id,
                'en_role' => $tbcRole->en_role ?? '',
                'ar_role' => $tbcRole->ar_role ?? '', // fallback
            ];
        });

        return response()->json([
            'tbcRoles' => $tbcRoles,
        ]);
    }

    public function employeeTbcRoles()
    {
        $tbcRoles = TbcRole::select('id', 'en_role')->get();

        $tbcRoles = $tbcRoles->map(function ($tbcRole) {
            return [
                'value' => (string) $tbcRole->id,
                'label' => $tbcRole->en_role,
            ];
        });
        
        return response()->json([
            'tbcRoles' => $tbcRoles,
        ]);
    }

    public function create(TbcRoleRequest $request)
    {
        $tbcRole = TbcRole::create([
            'en_role' => $request->input('en_role'),
            'ar_role' => $request->input('ar_role'),
            'created_by' => Auth::user()->id,
        ]);

        if ($tbcRole) {
            return response()->json([
                'message' => 'Team based code role Added Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to add team based code role. Please try again!',
        ], 500);
    }

    public function edit(TbcRoleRequest $request, TbcRole $tbcRole)
    {
        if ($tbcRole) {
            $tbcRole->en_role = $request->input('en_role');
            $tbcRole->ar_role = $request->input('ar_role');
            $tbcRole->updated_by = Auth::user()->id;
            $tbcRole->save();

            return response()->json([
                'message' => 'Team based code role updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update team based code role. Please try again!',
        ], 500);
    }

    public function destroy(TbcRole $tbcRole)
    {
        if (!$tbcRole) {
            return response()->json([
                'error' => 'Team based code role not found.'
            ], 404);
        }

        try {
            TbcRole::withoutEvents(function () use ($tbcRole) {
                $tbcRole->delete();
            });
            return response()->json([
                'message' => 'Team based code role deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete team based code role. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

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
            $import = new TbcRoleImport();

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
                'error' => 'Failed to import team based code roles. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_role' => 'Team Leader',
                    'ar_role' => 'قائد الفريق',
                ]
            ];

            $export = new class($sampleData) implements
                \Maatwebsite\Excel\Concerns\FromArray,
                \Maatwebsite\Excel\Concerns\WithHeadings
            {
                private $sampleData;

                public function __construct($sampleData)
                {
                    $this->sampleData = $sampleData;
                }

                public function array(): array
                {
                    return $this->sampleData;
                }

                public function headings(): array
                {
                    return ['en_role', 'ar_role'];
                }
            };

            return Excel::download($export, 'tbc_roles_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
