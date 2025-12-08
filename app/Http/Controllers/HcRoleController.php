<?php

namespace App\Http\Controllers;

use App\Http\Requests\HcRoleRequest;
use App\Imports\HcRoleImport;
use App\Models\HcRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class HcRoleController extends Controller
{
    public function healthcareRoles(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'hc_roles.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'hc_roles.id',
            'en_hcRole' => 'hc_roles.en_hcRole',
            'ar_hcRole' => 'hc_roles.ar_hcRole',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'hc_roles.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = HcRole::query();

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('hc_roles.en_hcRole', 'like', "%{$search}%")
                    ->orWhere('hc_roles.ar_hcRole', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $hcRoles = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $hcRoles->getCollection()->transform(function ($hcRole) {
            return [
                'id' => $hcRole->id,
                'en_hcRole' => $hcRole->en_hcRole ?? '',
                'ar_hcRole' => $hcRole->ar_hcRole ?? '', // fallback
            ];
        });

        return response()->json([
            'hcRoles' => $hcRoles,
        ]);
    }

    public function employeeHcRoles()
    {
        $hcRoles = HcRole::select('id', 'en_hcRole')->get();

        $hcRoles = $hcRoles->map(function ($hcRole) {
            return [
                'value' => (string) $hcRole->id,
                'label' => $hcRole->en_hcRole,
            ];
        });
        return response()->json([
            'hcRoles' => $hcRoles,
        ]);
    }

    public function create(HcRoleRequest $request)
    {
        $hcRole = HcRole::create([
            'en_hcRole' => $request->input('en_hcRole'),
            'ar_hcRole' => $request->input('ar_hcRole'),
            'created_by' => Auth::user()->id,
        ]);

        if ($hcRole) {
            return response()->json([
                'message' => 'Healthcare role Added Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to add healthcare role. Please try again!',
        ], 500);
    }

    public function edit(HcRoleRequest $request, HcRole $hcRole)
    {
        if ($hcRole) {
            $hcRole->en_hcRole = $request->input('en_hcRole');
            $hcRole->ar_hcRole = $request->input('ar_hcRole');
            $hcRole->updated_by = Auth::user()->id;
            $hcRole->save();

            return response()->json([
                'message' => 'Healthcare role updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update healthcare role. Please try again!',
        ], 500);
    }

    public function destroy(HcRole $hcRole)
    {
        if (!$hcRole) {
            return response()->json([
                'error' => 'Healthcare role not found.'
            ], 404);
        }

        try {
            HcRole::withoutEvents(function () use ($hcRole) {
                $hcRole->delete();
            });
            return response()->json([
                'message' => 'Healthcare role deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete healthcare role. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new HcRoleImport();

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
                'error' => 'Failed to import healthcare roles. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_hcRole' => 'Appointment and Scheduling',
                    'ar_hcRole' => 'جدولة المواعيد',
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
                    return ['en_hcRole', 'ar_hcRole'];
                }
            };

            return Excel::download($export, 'healthcareroles_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
