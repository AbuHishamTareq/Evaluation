<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClinicRequest;
use App\Imports\ClinicImport;
use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class ClinicController extends Controller
{
    public function clinics(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'clinics.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'clinics.id',
            'en_clinic' => 'clinics.en_clinic',
            'ar_clinic' => 'clinics.ar_clinic',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'clinics.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = Clinic::query();

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('clinics.en_clinic', 'like', "%{$search}%")
                    ->orWhere('clinics.ar_clinic', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $clinics = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $clinics->getCollection()->transform(function ($clinic) {
            return [
                'id' => $clinic->id,
                'en_clinic' => $clinic->en_clinic ?? '',
                'ar_clinic' => $clinic->ar_clinic ?? '', // fallback
            ];
        });

        return response()->json([
            'clinics' => $clinics,
        ]);
    }

    public function employeeClinics()
    {
        $clinics = Clinic::select('id', 'en_clinic')->get();

        $clinics = $clinics->map(function ($clinic) {
            return [
                'value' => (string) $clinic->id,
                'label' => $clinic->en_clinic,
            ];
        });
        return response()->json([
            'clinics' => $clinics,
        ]);
    }

    public function create(ClinicRequest $request)
    {
        $clinic = Clinic::create([
            'en_clinic' => $request->input('en_clinic'),
            'ar_clinic' => $request->input('ar_clinic'),
            'created_by' => Auth::user()->id,
        ]);

        if ($clinic) {
            return response()->json([
                'message' => 'Clinic Added Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to add clinic. Please try again!',
        ], 500);
    }

    public function edit(ClinicRequest $request, Clinic $clinic)
    {
        if ($clinic) {
            $clinic->en_clinic = $request->input('en_clinic');
            $clinic->ar_clinic = $request->input('ar_clinic');
            $clinic->updated_by = Auth::user()->id;
            $clinic->save();

            return response()->json([
                'message' => 'Clinic updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update clinic. Please try again!',
        ], 500);
    }

    public function destroy(Clinic $clinic)
    {
        if (!$clinic) {
            return response()->json([
                'error' => 'Clinic not found.'
            ], 404);
        }

        try {
            Clinic::withoutEvents(function () use ($clinic) {
                $clinic->delete();
            });
            return response()->json([
                'message' => 'Clinic deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete clinic. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new ClinicImport();

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
                'error' => 'Failed to import clinics. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_clinic' => 'Appointment and Scheduling',
                    'ar_clinic' => 'جدولة المواعيد',
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
                    return ['en_clinic', 'ar_clinic'];
                }
            };

            return Excel::download($export, 'clinics_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
