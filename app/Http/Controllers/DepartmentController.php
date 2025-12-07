<?php

namespace App\Http\Controllers;

use App\Http\Requests\DepartmentRequest;
use App\Imports\DepartmentImport;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class DepartmentController extends Controller
{
    public function departments(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'departments.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'departments.id',
            'en_department' => 'departments.en_department',
            'ar_department' => 'departments.ar_department',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'departments.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = Department::query();

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('departments.en_department', 'like', "%{$search}%")
                    ->orWhere('departments.ar_department', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $departments = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $departments->getCollection()->transform(function ($department) {
            return [
                'id' => $department->id,
                'en_department' => $department->en_department ?? '',
                'ar_department' => $department->ar_department ?? '', // fallback
            ];
        });

        return response()->json([
            'departments' => $departments,
        ]);
    }

    public function employeeDepartments()
    {
        $departments = Department::select('id', 'en_department')->get();

        $departments = $departments->map(function ($department) {
            return [
                'value' => (string) $department->id,
                'label' => $department->en_department,
            ];
        });
        return response()->json([
            'departments' => $departments,
        ]);
    }

    public function create(DepartmentRequest $request)
    {
        $department = Department::create([
            'en_department' => $request->input('en_department'),
            'ar_department' => $request->input('ar_department'),
            'created_by' => Auth::user()->id,
        ]);

        if ($department) {
            return response()->json([
                'message' => 'Department Added Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to add department. Please try again!',
        ], 500);
    }

    public function edit(DepartmentRequest $request, Department $department)
    {
        if ($department) {
            $department->en_department = $request->input('en_department');
            $department->ar_department = $request->input('ar_department');
            $department->updated_by = Auth::user()->id;
            $department->save();

            return response()->json([
                'message' => 'Department updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update department. Please try again!',
        ], 500);
    }

    public function destroy(Department $department)
    {
        if (!$department) {
            return response()->json([
                'error' => 'Department not found.'
            ], 404);
        }

        try {
            Department::withoutEvents(function () use ($department) {
                $department->delete();
            });
            return response()->json([
                'message' => 'Department deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete department. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new DepartmentImport();

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
                'error' => 'Failed to import departments. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_department' => 'Service of Excellance',
                    'ar_department' => 'تميز الخدمة',
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
                    return ['en_department', 'ar_department'];
                }
            };

            return Excel::download($export, 'departments_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
