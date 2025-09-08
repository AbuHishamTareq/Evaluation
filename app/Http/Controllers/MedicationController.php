<?php

namespace App\Http\Controllers;

use App\Http\Requests\MedicationRequest;
use App\Imports\MedicationImport;
use App\Models\Domain;
use App\Models\Header;
use App\Models\Medication;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class MedicationController extends Controller
{
    public function medications(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $sortableMap = [
            'id' => 'id',
            'drug_name' => 'drug_name',
            'allocation' => 'allocation',
            'standard_quantity' => 'standard_quantity',
            'section_id' => 'section_id',
            'created_at' => 'created_at',
        ];

        $sortColumn = $sortableMap[$sortBy] ?? 'created_at';

        if ($perPage == -1) {
            $perPage = 100000;
        }

        $medicationQuery = Medication::with(['section', 'domain'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('drug_name', 'like', "%{$search}%")
                        ->orWhere('allocation', 'like', "%{$search}%")
                        ->orWhereHas('section', fn($z) => $z->where('en_label', 'like', "%{$search}%"))
                        ->orWhereHas('domain', fn($x) => $x->where('en_label', 'like', "%{$search}%"));
                });
            })
            ->orderBy($sortColumn, $sortDir);

        $medications = $medicationQuery->paginate($perPage, ['*'], 'page', $page);

        $medications->getCollection()->transform(function ($medication) {
            return [
                'id' => $medication->id,
                'drug_name' => $medication->drug_name,
                'allocation' => $medication->allocation,
                'standard_quantity' => $medication->standard_quantity,
                'section_id' => $medication->section_id,
                'section_name' => $medication->section->en_label ?? '',
                'domain_id' => $medication->domain_id,
                'domain_name' => $medication->domain->en_label ?? '',
            ];
        });

        $sections = Section::where('evaluation_type', 'tabular')->get();
        $domains = Domain::get();

        return response()->json([
            'medications' => $medications,
            'sections' => $sections,
            'domains' => $domains,
        ]);
    }

    public function create(MedicationRequest $request)
    {
        $medication = Medication::create([
            'drug_name' => $request->input('drug_name'),
            'allocation' => $request->input('allocation'),
            'standard_quantity' => $request->input('standard_quantity'),
            'section_id' => $request->input('section'),
            'domain_id' => $request->input('domain'),
        ]);

        if ($medication) {
            return response()->json([
                'message' => 'Medication created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create medication. Please try again!',
        ], 500);
    }

    public function edit(MedicationRequest $request, Medication $medication)
    {
        if ($medication) {
            $medication->drug_name = $request->input('drug_name');
            $medication->allocation = $request->input('allocation');
            $medication->standard_quantity = $request->input('standard_quantity');
            $medication->section_id = $request->input('section');
            $medication->domain_id = $request->input('domain');
            $medication->save();

            return response()->json([
                'message' => 'Medication updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update medication. Please try again!',
        ], 500);
    }

    public function destroy(Medication $medication)
    {
        if (!$medication) {
            return response()->json([
                'error' => 'Medication not found.'
            ], 404);
        }

        try {
            Medication::withoutEvents(function () use ($medication) {
                $medication->delete();
            });
            return response()->json([
                'message' => 'Medication deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete medication. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new MedicationImport();

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
                'error' => 'Failed to import medications. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sections = Section::select('name', 'en_label')->where('evaluation_type', 'tabular')->get();

            $sampleData = [
                [
                    'drug_name' => 'Drug Name',
                    'allocation' => 'Allocation',
                    'standard_quantity' => '10',
                    'section_id' => $sections->first()->en_label ?? 'Medication',
                    'domain_id' => 'Domain Name',
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
                    return ['drug_name', 'allocation', 'standard_quantity', 'section_id', 'domain_id'];
                }
            };

            return Excel::download($export, 'medications_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function getMedications(Request $request)
    {
        $section = $request->query('section');
        $query = Medication::query();

        if ($section) {
            $query->where('section_id', $section);
        }

        $medications = $query->get(['id', 'drug_name', 'allocation', 'standard_quantity']); // select needed columns

        return response()->json($medications);
    }

    public function getHeaders(Request $request)
    {
        $section = $request->query('section');
        $query = Header::query();

        if ($section) {
            $query->where('section_id', $section);
        }

        $headers = $query->with('fields')->orderBy('order', 'ASC')->get();

        return response()->json($headers);
    }
}
