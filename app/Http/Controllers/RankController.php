<?php

namespace App\Http\Controllers;

use App\Http\Requests\RankRequest;
use App\Imports\RankImport;
use App\Models\Rank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class RankController extends Controller
{
    public function ranks(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $sortableMap = [
            'id' => 'id',
            'en_rank' => 'en_rank',
            'ar_rank' => 'ar_rank',
        ];

        $sortColumn = $sortableMap[$sortBy] ?? 'created_at';

        if ($perPage == -1) {
            $perPage = 100000;
        }

        $rankQuery = Rank::when($search, function ($q) use ($search) {
            $q->where(function ($q) use ($search) {
                $q->where('en_rank', 'like', "%{$search}%")
                    ->orWhere('ar_rank', 'like', "%{$search}%");
            });
        })
            ->orderBy($sortColumn, $sortDir);

        $ranks = $rankQuery->paginate($perPage, ['*'], 'page', $page);

        $ranks->getCollection()->transform(function ($rank) {
            return [
                'id' => $rank->id,
                'en_rank' => $rank->en_rank,
                'ar_rank' => $rank->ar_rank,
            ];
        });

        return response()->json([
            'ranks' => $ranks,
        ]);
    }

    public function employeeRanks()
    {
        $ranks = Rank::select('id', 'en_rank')->get();

        $ranks = $ranks->map(function ($rank) {
            return [
                'value' => (string) $rank->id,
                'label' => $rank->en_rank,
            ];
        });

        return response()->json([
            'ranks' => $ranks,
        ]);
    }

    public function create(RankRequest $request)
    {
        $rank = Rank::create([
            'en_rank' => $request->input('en_rank'),
            'ar_rank' => $request->input('ar_rank'),
            'created_by' => Auth::id(),
        ]);

        if ($rank) {
            return response()->json([
                'message' => 'Rank created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create rank. Please try again!',
        ], 500);
    }

    public function edit(RankRequest $request, Rank $rank)
    {
        if ($rank) {
            $rank->en_rank = $request->input('en_rank');
            $rank->ar_rank = $request->input('ar_rank');
            $rank->updated_by = Auth::id();
            $rank->save();

            return response()->json([
                'message' => 'Rank updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update Rank. Please try again!',
        ], 500);
    }

    public function destroy(Rank $rank)
    {
        if (!$rank) {
            return response()->json([
                'error' => 'Rank not found.'
            ], 404);
        }

        try {
            Rank::withoutEvents(function () use ($rank) {
                $rank->delete();
            });
            return response()->json([
                'message' => 'Rank deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete Rank. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new RankImport();

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
                    'en_rank' => 'Consultant',
                    'ar_rank' => 'استشاري',
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
                    return ['en_rank', 'ar_rank'];
                }
            };

            return Excel::download($export, 'healthcare_rank_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
