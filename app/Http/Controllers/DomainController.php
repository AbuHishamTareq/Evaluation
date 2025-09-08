<?php

namespace App\Http\Controllers;

use App\Http\Requests\DomainRequest;
use App\Imports\DomainImport;
use App\Models\Domain;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class DomainController extends Controller
{
    public function domains(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $sortableMap = [
            'id' => 'id',
            'en_label' => 'en_label',
            'ar_label' => 'ar_label',
            'section_name' => 'section_id',
            'created_at' => 'created_at',
        ];

        $sortColumn = $sortableMap[$sortBy] ?? 'created_at';

        if ($perPage == -1) {
            $perPage = 100000;
        }

        $domainQuery = Domain::with(['section'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('en_label', 'like', "%{$search}%")
                        ->orWhere('ar_label', 'like', "%{$search}%")
                        ->orWhereHas('section', fn($z) => $z->where('label', 'like', "%{$search}%"));
                });
            })
            ->orderBy($sortColumn, $sortDir);

        $domains = $domainQuery->paginate($perPage, ['*'], 'page', $page);

        $domains->getCollection()->transform(function ($domain) {
            return [
                'id' => $domain->id,
                'label' => $domain->en_label,
                'ar_label' => $domain->ar_label,
                'section_id' => $domain->section_id,
                'section_name' => $domain->section->en_label ?? '',
                'status' => $domain->status,
            ];
        });

        $sections = Section::all()->map(function ($section) {
            return [
                'id' => $section->id,
                'label' => $section->en_label,
                'ar_label' => $section->ar_label,
                'name' => $section->name,
            ];
        });

        return response()->json([
            'domains' => $domains,
            'sections' => $sections,
        ]);
    }

    public function create(DomainRequest $request)
    {
        $center = Domain::create([
            'en_label' => $request->input('label'),
            'ar_label' => $request->input('ar_label'),
            'section_id' => $request->input('section'),
            'name' => Str::slug($request->input('label')),
        ]);

        if ($center) {
            return response()->json([
                'message' => 'Domain created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create domain. Please try again!',
        ], 500);
    }

    public function edit(DomainRequest $request, Domain $domain)
    {
        if ($domain) {
            $domain->en_label = $request->input('label');
            $domain->ar_label = $request->input("ar_label");
            $domain->section_id = $request->input("section");
            $domain->save();

            return response()->json([
                'message' => 'Domain updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update domain. Please try again!',
        ], 500);
    }

    public function destroy(Domain $domain)
    {
        if (!$domain) {
            return response()->json([
                'error' => 'Domain not found.'
            ], 404);
        }

        try {
            Domain::withoutEvents(function () use ($domain) {
                $domain->delete();
            });
            return response()->json([
                'message' => 'Domaine deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete domain. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function status(Request $request, Domain $domain)
    {
        if ($domain) {
            $domain->status = $request->input('status');
            $domain->save();

            return response()->json([
                'message' => 'Domain updated Successfully!'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update domain. Please try again!',
        ], 500);
    }

    public function bulkActivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domain_ids' => 'required|array|min:1',
            'domain_ids.*' => 'integer|exists:domains,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid Domain IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $domainIds = $request->input('domain_ids');

        $this->bulkActivateInActivate($domainIds, 'active');
    }

    public function bulkDeactivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domain_ids' => 'required|array|min:1',
            'domain_ids.*' => 'integer|exists:domains,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid Domain IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $domainIds = $request->input('domain_ids');

        $this->bulkActivateInActivate($domainIds, 'inactive');
    }

    private function bulkActivateInActivate($domainIds, $status)
    {
        try {
            $domainQuery = Domain::whereIn('id', $domainIds);


            $updatedCount = $domainQuery->update(['status' => $status]);

            return response()->json([
                'message' => "Successfully " . $status . "d {$updatedCount} domain(s).",
                'updated_count' => $updatedCount
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to activate domains. Please try again later.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid file. Please upload a CSV or Excel file (max 10MB).',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $import = new DomainImport();

            Excel::import($import, $file);

            $stats = $import->getImportStats();

            $failures = $import->failures();
            $errors = $import->errors();

            $response = [
                'message' => 'Import completed successfully!',
                'stats' => $stats,
                'imported_count' => $stats['imported'],
                'skipped_count' => $stats['skipped'],
                'total_processed' => $stats['total_processed']
            ];

            if (!empty($errors) || !empty($failures)) {
                $response['warnings'] = [];

                if (!empty($stats['errors'])) {
                    $response['warnings'] = array_merge($response['warnings'], $stats['errors']);
                }

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
                    'en_label' => 'Test example domain',
                    'ar_label' => 'مثال على مجال الاختبار',
                    'section_id' => 'Test Section',
                ],
                [
                    'en_label' => 'Test example domain',
                    'ar_label' => 'مثال على مجال الاختبار',
                    'section_id' => 'Test Section',
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
                    return ['en_label', 'ar_label', 'section_id'];
                }
            };

            return Excel::download($export, 'domains_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}