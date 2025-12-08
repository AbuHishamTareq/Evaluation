<?php

namespace App\Http\Controllers;

use App\Http\Requests\TbcRequest;
use App\Imports\TbcImport;
use App\Models\Center;
use App\Models\Tbc;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class TbcController extends Controller
{
    public function tbcs(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'tbcs.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'tbcs.id',
            'code' => 'tbcs.code',
            'center_name' => 'centers.label',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'tbcs.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = Tbc::query()
            ->leftJoin('centers', 'tbcs.center_id', '=', 'centers.name')
            ->select('tbcs.*', 'centers.label as center_name');

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('tbcs.code', 'like', "%{$search}%")
                    ->orWhere('centers.label', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $tbcs = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection (no need for ->center now, we use zone_name)
        $tbcs->getCollection()->transform(function ($tbc) {
            return [
                'id' => $tbc->id,
                'code' => $tbc->code,
                'center_id' => $tbc->center_id,
                'center_name' => $tbc->center_name ?? '', // fallback
            ];
        });

        return response()->json([
            'tbcs' => $tbcs,
        ]);
    }

    public function tbcsByPhc($phcId)
    {
        $tbcs = Tbc::select('code', 'name')->where('center_id', $phcId)->get();

        if ($tbcs) {
            $tbcs = $tbcs->map(function ($tbcs) {
                return [
                    'value' => (string) $tbcs->name,
                    'label' => $tbcs->code,
                ];
            });
            return response()->json([
                'tbcs' => $tbcs,
            ]);
        }

        return response()->json([
            'error' => 'Team Based Code not found.',
        ], 404);
    }

    public function create(TbcRequest $request)
    {
        $center = Tbc::create([
            'code' => $request->input('code'),
            'name' => Str::slug($request->input('code')),
        ]);

        if ($center) {
            return response()->json([
                'message' => 'Team based code created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create team based code. Please try again!',
        ], 500);
    }

    public function edit(TbcRequest $request, Tbc $tbc)
    {
        if ($tbc) {
            $tbc->code = $request->input('code');
            $tbc->save();

            return response()->json([
                'message' => 'Team Based Code updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update team based code. Please try again!',
        ], 500);
    }

    public function destroy(Tbc $tbc)
    {
        if (!$tbc) {
            return response()->json([
                'error' => 'Center not found.'
            ], 404);
        }

        try {
            Center::withoutEvents(function () use ($tbc) {
                $tbc->delete();
            });
            return response()->json([
                'message' => 'Team based code deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete team based code. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Import users from CSV/Excel file
     */
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
            $import = new TbcImport();

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

    /**
     * Download sample import template
     */
    public function downloadTemplate()
    {
        try {
            $centers = Center::select('label', 'name')->get();

            $sampleData = [
                [
                    'code' => 'TBC-1000',
                    'center_id' => $centers->first()->label ?? 'Al Rqiaqah',
                ],
                [
                    'code' => 'TBC-1001',
                    'center_id' => $centers->first()->label ?? 'Al Rqiaqah',
                ],
            ];

            $export = new class($sampleData, $centers) implements
                \Maatwebsite\Excel\Concerns\FromArray,
                \Maatwebsite\Excel\Concerns\WithHeadings,
                \Maatwebsite\Excel\Concerns\WithMultipleSheets
            {
                private $sampleData;
                private $centers;

                public function __construct($sampleData, $centers)
                {
                    $this->sampleData = $sampleData;
                    $this->centers = $centers;
                }

                public function array(): array
                {
                    return $this->sampleData;
                }

                public function headings(): array
                {
                    return ['code', 'center_id'];
                }

                public function sheets(): array
                {
                    return [
                        'Tbcs' => $this,
                        'Available Centers' => new class($this->centers) implements
                            \Maatwebsite\Excel\Concerns\FromCollection,
                            \Maatwebsite\Excel\Concerns\WithHeadings
                        {
                            private $centers;

                            public function __construct($centers)
                            {
                                $this->centers = $centers;
                            }

                            public function collection()
                            {
                                return $this->centers;
                            }

                            public function headings(): array
                            {
                                return ['Center ID', 'Center Name'];
                            }
                        },
                    ];
                }
            };

            return Excel::download($export, 'tbcs_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
