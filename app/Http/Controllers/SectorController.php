<?php

namespace App\Http\Controllers;

use App\Http\Requests\SectionRequest;
use App\Http\Requests\SectorRequest;
use App\Imports\SectorImport;
use App\Models\Sector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class SectorController extends Controller
{
    public function sectors(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'sectors.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'sectors.id',
            'en_sector' => 'sectors.en_sector',
            'ar_sector' => 'sectors.ar_sector',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'sectors.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = Sector::query();

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('sectors.en_sector', 'like', "%{$search}%")
                    ->orWhere('sectors.ar_sector', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $sectors = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $sectors->getCollection()->transform(function ($sector) {
            return [
                'id' => $sector->id,
                'en_sector' => $sector->en_sector ?? '',
                'ar_sector' => $sector->ar_sector ?? '', // fallback
            ];
        });

        return response()->json([
            'sectors' => $sectors,
        ]);
    }

    public function employeeSectors()
    {
        $sectors = Sector::select('id', 'en_sector')->get();

        $sectors = $sectors->map(function ($sector) {
            return [
                'value' => (string) $sector->id,
                'label' => $sector->en_sector,
            ];
        });

        return response()->json([
            'sectors' => $sectors,
        ]);
    }

    public function create(SectionRequest $request)
    {
        $sector = Sector::create([
            'en_sector' => $request->input('en_sector'),
            'ar_sector' => $request->input('ar_sector'),
            'created_by' => Auth::user()->id,
        ]);

        if ($sector) {
            return response()->json([
                'message' => 'Healthcare Field Added Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to add Healthcare Field. Please try again!',
        ], 500);
    }

    public function edit(SectorRequest $request, Sector $sector)
    {
        if ($sector) {
            $sector->en_sector = $request->input('en_sector');
            $sector->ar_sector = $request->input('ar_sector');
            $sector->updated_by = Auth::user()->id;
            $sector->save();

            return response()->json([
                'message' => 'Healthcare Field updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update healthcare field. Please try again!',
        ], 500);
    }

    public function destroy(Sector $sector)
    {
        if (!$sector) {
            return response()->json([
                'error' => 'Healthcare field not found.'
            ], 404);
        }

        try {
            Sector::withoutEvents(function () use ($sector) {
                $sector->delete();
            });
            return response()->json([
                'message' => 'Healthcare field deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete healthcare field. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new SectorImport();

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
                'error' => 'Failed to import healthcare fields. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_sector' => 'Dentistry and Related Specialties',
                    'ar_sector' => 'طب الأسنان والتخصصات ذات الصلة',
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
                    return ['en_sector', 'ar_sector'];
                }
            };

            return Excel::download($export, 'healthcare_fields_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
