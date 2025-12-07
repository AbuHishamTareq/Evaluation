<?php

namespace App\Http\Controllers;

use App\Http\Requests\NationalityRequest;
use App\Imports\NationalityImport;
use App\Models\Nationality;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class NationalityController extends Controller
{
    public function nationalities(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'nationalities.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'nationalities.id',
            'en_nationality' => 'nationalities.en_nationality',
            'ar_nationality' => 'nationalities.ar_nationality',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'nationalities.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = Nationality::query();

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('nationalities.en_nationality', 'like', "%{$search}%")
                    ->orWhere('nationalities.ar_nationality', 'like', "%{$search}%")
                    ->orWhere('nationalities.iso_code_3', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $nationalities = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $nationalities->getCollection()->transform(function ($nationality) {
            return [
                'id' => $nationality->id,
                'iso_code_3' => $nationality->iso_code_3 ?? '',
                'en_nationality' => $nationality->en_nationality ?? '',
                'ar_nationality' => $nationality->ar_nationality ?? '', // fallback
            ];
        });

        info("Fetched Nationalities: ", $nationalities->toArray());

        return response()->json([
            'nationalities' => $nationalities,
        ]);
    }

    public function employeeNationalities()
    {
        $nationalities = Nationality::select('id', 'en_nationality')->get();

        $nationalities = $nationalities->map(function ($nationality) {
            return [
                'value' => (string) $nationality->id,
                'label' => $nationality->en_nationality,
            ];
        });

        return response()->json([
            'nationalities' => $nationalities,
        ]);
    }

    public function create(NationalityRequest $request)
    {
        $center = Nationality::create([
            'iso_code_3' => $request->input('iso_code_3'),
            'en_nationality' => $request->input('en_nationality'),
            'ar_nationality' => $request->input('ar_nationality'),
            'created_by' => Auth::user()->id,
        ]);

        if ($center) {
            return response()->json([
                'message' => 'Nationality Added Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to add Nationality. Please try again!',
        ], 500);
    }

    public function edit(NationalityRequest $request, Nationality $nationality)
    {
        if ($nationality) {
            $nationality->iso_code_3 = $request->input('iso_code_3');
            $nationality->en_nationality = $request->input('en_nationality');
            $nationality->ar_nationality = $request->input('ar_nationality');
            $nationality->updated_by = Auth::user()->id;
            $nationality->save();

            return response()->json([
                'message' => 'Nationality updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update nationality. Please try again!',
        ], 500);
    }

    public function destroy(Nationality $nationality)
    {
        if (!$nationality) {
            return response()->json([
                'error' => 'Nationality not found.'
            ], 404);
        }

        try {
            Nationality::withoutEvents(function () use ($nationality) {
                $nationality->delete();
            });
            return response()->json([
                'message' => 'Nationality deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete nationality. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new NationalityImport();

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
                'error' => 'Failed to import nationalities. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'iso_code_3' => 'AFG',
                    'en_nationality' => 'Afghanistan',
                    'ar_nationality' => 'أفغانستان',
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
                    return ['iso_code_3', 'en_nationality', 'ar_nationality'];
                }
            };

            return Excel::download($export, 'nationalities_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
