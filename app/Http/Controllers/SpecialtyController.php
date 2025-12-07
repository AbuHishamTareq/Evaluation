<?php

namespace App\Http\Controllers;

use App\Http\Requests\SpecialtyRequest;
use App\Imports\SpecialtyImport;
use App\Models\Sector;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class SpecialtyController extends Controller
{
    public function specialties(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $sortableMap = [
            'id' => 'id',
            'en_specialty' => 'en_specialty',
            'ar_specialty' => 'ar_specialty',
        ];

        $sortColumn = $sortableMap[$sortBy] ?? 'created_at';

        if ($perPage == -1) {
            $perPage = 100000;
        }

        $specialtyQuery = Specialty::when($search, function ($q) use ($search) {
            $q->where(function ($q) use ($search) {
                $q->where('en_specialty', 'like', "%{$search}%")
                    ->orWhere('ar_specialty', 'like', "%{$search}%");
            });
        })
            ->orderBy($sortColumn, $sortDir);

        $specialties = $specialtyQuery->paginate($perPage, ['*'], 'page', $page);

        $specialties->getCollection()->transform(function ($specialty) {
            return [
                'id' => $specialty->id,
                'en_specialty' => $specialty->en_specialty,
                'ar_specialty' => $specialty->ar_specialty,
            ];
        });

        info($specialties);

        return response()->json([
            'specialties' => $specialties,
        ]);
    }

    public function employeeSpecialties()
    {
        $specialties = Specialty::select('id', 'en_specialty')->get();

        $specialties = $specialties->map(function ($specialty) {
            return [
                'value' => (string) $specialty->id,
                'label' => $specialty->en_specialty,
            ];
        });

        return response()->json([
            'specialties' => $specialties,
        ]);
    }

    public function create(SpecialtyRequest $request)
    {
        $specialty = Specialty::create([
            'en_specialty' => $request->input('en_specialty'),
            'ar_specialty' => $request->input('ar_specialty'),
            'created_by' => Auth::id(),
        ]);

        if ($specialty) {
            return response()->json([
                'message' => 'Specialty created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create specialty. Please try again!',
        ], 500);
    }

    public function edit(SpecialtyRequest $request, Specialty $specialty)
    {
        if ($specialty) {
            $specialty->en_specialty = $request->input('en_specialty');
            $specialty->ar_specialty = $request->input('ar_specialty');
            $specialty->updated_by = Auth::id();
            $specialty->save();

            return response()->json([
                'message' => 'Specialty updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update specialty. Please try again!',
        ], 500);
    }

    public function destroy(Specialty $specialty)
    {
        if (!$specialty) {
            return response()->json([
                'error' => 'Specialty not found.'
            ], 404);
        }

        try {
            Specialty::withoutEvents(function () use ($specialty) {
                $specialty->delete();
            });
            return response()->json([
                'message' => 'Specialty deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete specialty. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new SpecialtyImport();

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
                'error' => 'Failed to import healthcare specialties. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_specialty' => 'Restorative Dentistry',
                    'ar_specialty' => 'طب الأسنان الترميمي',
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
                    return ['en_specialty', 'ar_specialty'];
                }
            };

            return Excel::download($export, 'healthcare_specialty_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
