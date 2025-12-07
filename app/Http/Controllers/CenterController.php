<?php

namespace App\Http\Controllers;

use App\Http\Requests\CenterRequest;
use App\Imports\CenterImport;
use App\Models\Center;
use App\Models\Tbc;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class CenterController extends Controller
{
    public function centers(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $sortableMap = [
            'id' => 'id',
            'label' => 'label',
            'phc_moh_code' => 'phc_moh_code',
            'zone_name' => 'zone_id',
            'created_at' => 'created_at',
        ];

        $sortColumn = $sortableMap[$sortBy] ?? 'created_at';

        if ($perPage == -1) {
            $perPage = 100000;
        }

        $centerQuery = Center::with(['zone', 'tbcs'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('label', 'like', "%{$search}%")
                        ->orWhere('phc_moh_code', 'like', "%{$search}%")
                        ->orWhereHas('zone', fn($z) => $z->where('label', 'like', "%{$search}%"))
                        ->orWhereHas('tbcs', fn($t) => $t->where('code', 'like', "%{$search}%"));
                });
            })
            ->orderBy($sortColumn, $sortDir);

        $centers = $centerQuery->paginate($perPage, ['*'], 'page', $page);

        $centers->getCollection()->transform(function ($center) {
            return [
                'id' => $center->id,
                'label' => $center->label,
                'phc_moh_code' => $center->phc_moh_code,
                'zone_id' => $center->zone_id,
                'zone_name' => $center->zone->label ?? '',
                'codes' => $center->tbcs->map(fn($tbc) => [
                    'label' => $tbc->code,
                    'name' => $tbc->name,
                ]),
                'status' => $center->status,
            ];
        });

        $zones = Zone::get();

        return response()->json([
            'centers' => $centers,
            'zones' => $zones,
        ]);
    }

    public function centersbyZone($zoneId) {
        $centers = Center::select('name', 'label', 'phc_moh_code')->where('zone_id', $zoneId)->get();

        $centers = $centers->map(function ($center) {
            return [
                'value' => $center->name,
                'label' => $center->label,
                'phcCode' => $center->phc_moh_code,
            ];
        });

        return response()->json([
            'centers' => $centers,
        ]);
    }

    public function create(CenterRequest $request)
    {
        $center = Center::create([
            'label' => $request->input('label'),
            'phc_moh_code' => $request->input('phc_moh_code'),
            'name' => Str::slug($request->input('label')),
            'zone_id' => $request->input('zone'),
        ]);

        if ($center) {
            return response()->json([
                'message' => 'Center created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create center. Please try again!',
        ], 500);
    }

    public function edit(CenterRequest $request, Center $center)
    {
        if ($center) {
            $center->label = $request->input('label');
            $center->phc_moh_code = $request->input('phc_moh_code');
            $center->zone_id = $request->input('zone');
            $center->save();

            return response()->json([
                'message' => 'Center created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create center. Please try again!',
        ], 500);
    }

    public function destroy(Center $center)
    {
        if (!$center) {
            return response()->json([
                'error' => 'Center not found.'
            ], 404);
        }

        try {
            Center::withoutEvents(function () use ($center) {
                $center->delete();
            });
            return response()->json([
                'message' => 'Center deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete center. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function status(Request $request, Center $center)
    {
        if ($center) {
            $center->status = $request->input('status');
            $center->save();

            return response()->json([
                'message' => 'User updated Successfully!'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update user. Please try again!',
        ], 500);
    }

    /**
     * Bulk activate users
     */
    public function bulkActivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'center_ids' => 'required|array|min:1',
            'center_ids.*' => 'integer|exists:centers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid Center IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $centerIds = $request->input('center_ids');

        $this->bulkActivateInActivate($centerIds, 'active');
    }

    /**
     * Bulk activate users
     */
    public function bulkDeactivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domain_ids' => 'required|array|min:1',
            'center_ids.*' => 'integer|exists:centers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid Center IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $centerIds = $request->input('center_ids');

        $this->bulkActivateInActivate($centerIds, 'inactive');
    }

    private function bulkActivateInActivate($centerIds, $status)
    {
        try {
            // Build query with role-based filtering
            $centerQuery = Center::whereIn('id', $centerIds);


            $updatedCount = $centerQuery->update(['status' => $status]);

            return response()->json([
                'message' => "Successfully " . $status . "d {$updatedCount} user(s).",
                'updated_count' => $updatedCount
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to activate users. Please try again later.',
                'details' => $e->getMessage()
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
            $import = new CenterImport();

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
                'error' => 'Failed to import centers. Please check your file format and try again.',
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
            $zones = Zone::select('name', 'label')->get();

            $sampleData = [
                [
                    'name' => 'John Hopkins',
                    'phc_moh_code' => 'PHC001',
                    'zone_id' => $zones->first()->label ?? 'Southern Zone',
                ],
                [
                    'name' => 'Al Ahsa Center',
                    'phc_moh_code' => 'PHC002',
                    'zone_id' => $zones->first()->label ?? 'Northern Zone',
                ],
            ];

            $export = new class($sampleData, $zones) implements
                \Maatwebsite\Excel\Concerns\FromArray,
                \Maatwebsite\Excel\Concerns\WithHeadings,
                \Maatwebsite\Excel\Concerns\WithMultipleSheets
            {
                private $sampleData;
                private $zones;

                public function __construct($sampleData, $zones)
                {
                    $this->sampleData = $sampleData;
                    $this->zones = $zones;
                }

                public function array(): array
                {
                    return $this->sampleData;
                }

                public function headings(): array
                {
                    return ['name', 'phc_moh_code', 'zone_id'];
                }

                public function sheets(): array
                {
                    return [
                        'Centers' => $this,
                        'Available Zones' => new class($this->zones) implements
                            \Maatwebsite\Excel\Concerns\FromCollection,
                            \Maatwebsite\Excel\Concerns\WithHeadings
                        {
                            private $zones;

                            public function __construct($zones)
                            {
                                $this->zones = $zones;
                            }

                            public function collection()
                            {
                                return $this->zones;
                            }

                            public function headings(): array
                            {
                                return ['Zone ID', 'Zone Name'];
                            }
                        },
                    ];
                }
            };

            return Excel::download($export, 'centers_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function assignTeamCodes(Request $request, Center $center)
    {
        $validator = Validator::make($request->all(), [
            'team_code_ids' => 'required|array',
            'team_code_ids.*' => 'integer|exists:tbcs,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid team code IDs provided.',
                'details' => $validator->errors(),
            ], 422);
        }

        try {
            // Reset previous TBCs (if you want to detach others)
            // First: Unassign all existing TBCs from this center
            Tbc::where('center_id', $center->name)->update(['center_id' => null]);

            // Then: assign new ones
            Tbc::whereIn('id', $request->input('team_code_ids'))
                ->update(['center_id' => $center->name]);

            return response()->json([
                'message' => 'Team codes assigned successfully!',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to assign team codes. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getTeamBasedCodes()
    {
        $teamBasedCodes = Tbc::select('id', 'code', 'name')->get();
        return response()->json($teamBasedCodes);
    }

    /**
     * Get currently assigned team-based codes for a specific center
     * This method supports the frontend AssignTeamCodeModal functionality
     */
    public function getAssignedTeamCodes(Center $center)
    {
        try {
            // Get all TBCs assigned to this center
            $assignedTbcs = Tbc::select('id', 'code', 'name')
                ->where('center_id', $center->name)
                ->get();

            return response()->json($assignedTbcs, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch assigned team codes. Details: ' . $e->getMessage(),
            ], 500);
        }
    }
}
