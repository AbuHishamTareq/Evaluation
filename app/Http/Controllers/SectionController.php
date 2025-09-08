<?php

namespace App\Http\Controllers;

use App\Http\Requests\SectionRequest;
use App\Imports\SectionImport;
use App\Models\Section;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Str;
use Validator;

class SectionController extends Controller
{
    public function sections(Request $request) 
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'tbcs.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'sections.id',
            'en_label' => 'sections.en_label',
            'ar_label' => 'sections.ar_label',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'sections.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = Section::query()->select('sections.*');

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('sections.en_label', 'like', "%{$search}%")
                    ->orWhere('sections.ar_label', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $sections = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $sections->getCollection()->transform(function ($section) {
            return [
                'id' => $section->id,
                'en_label' => $section->en_label,
                'ar_label' => $section->ar_label,
                'type' => $section->evaluation_type, //=== 'regular' ? 'Regular Evaluation' : 'Tabular Evaluation',
            ];
        });

        return response()->json([
            'sections' => $sections,
        ]);
    }

    public function create(SectionRequest $request) 
    {
        
        $section = Section::create([
            'en_label' => $request->input('en_label'),
            'ar_label' => $request->input('ar_label'),
            'name' => Str::slug($request->input('en_label')),
            'evaluation_type' => $request->input('type'),
        ]);

        if ($section) {
            return response()->json([
                'message' => 'Section created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create section. Please try again!',
        ], 500);
    }

    public function edit(SectionRequest $request, Section $section)
    {
        if ($section) {
            $section->en_label = $request->input('en_label');
            $section->ar_label = $request->input('ar_label');
            $section->evaluation_type = $request->input('type');
            $section->save();

            return response()->json([
                'message' => 'Section updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update section. Please try again!',
        ], 500);
    }

    public function destroy(Section $section)
    {
        if (!$section) {
            return response()->json([
                'error' => 'Section not found.'
            ], 404);
        }

        try {
            Section::withoutEvents(function () use ($section) {
                $section->delete();
            });
            return response()->json([
                'message' => 'Section deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete section. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new SectionImport();

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
                'error' => 'Failed to import team based codes. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_label' => 'Test example Section',
                    'ar_label' => 'مثال على قسم الاختبار',
                    'type' => 'Regular Evaluation'
                ],
                [
                    'en_label' => 'Test example Section',
                    'ar_label' => 'مثال على قسم الاختبار',
                    'type' => 'Tabular Evaluation'
                ],
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
                    return ['en_label', 'ar_label', 'type'];
                }
            };

            return Excel::download($export, 'sections_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getTabularSections() {
        $sections = Section::where('evaluation_type', 'tabular')->get();

        return response()->json([
            'sections' => $sections,
        ]);
    }
}
