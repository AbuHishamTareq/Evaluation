<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Imports\CategoryImport;
use App\Models\Category;
use App\Models\Rank;
use App\Models\Sector;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class CategoryController extends Controller
{
    public function categories(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $sortableMap = [
            'id' => 'id',
            'category' => 'category',
            'sector_id' => 'sector_id',
            'specialty_id' => 'specialty_id',
            'rank_id' => 'rank_id',
        ];

        $sortColumn = $sortableMap[$sortBy] ?? 'created_at';

        if ($perPage == -1) {
            $perPage = 100000;
        }

        $categoryQuery = Category::with(['sector', 'specialty', 'rank'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('category', 'like', "%{$search}%")
                        ->orWhereHas('sector', fn($z) => $z->where('en_sector', 'like', "%{$search}%"))
                        ->orWhereHas('specialty', fn($z) => $z->where('en_specialty', 'like', "%{$search}%"))
                        ->orWhereHas('rank', fn($z) => $z->where('en_rank', 'like', "%{$search}%"));
                });
            })
            ->orderBy($sortColumn, $sortDir);

        $categories = $categoryQuery->paginate($perPage, ['*'], 'page', $page);

        $categories->getCollection()->transform(function ($category) {
            return [
                'id' => $category->id,
                'category' => $category->category,
                'sector_id' => $category->sector_id,
                'en_sector' => $category->sector->en_sector ?? '',
                'specialty_id' => $category->specialty_id,
                'en_specialty' => $category->specialty->en_specialty ?? '',
                'rank_id' => $category->rank_id,
                'en_rank' => $category->rank->en_rank ?? '',
            ];
        });

        $sectors = Sector::get()->map(function ($sector) {
            return [
                'name' => $sector->id,
                'label' => $sector->en_sector,
            ];
        });

        $specialties = Specialty::get()->map(function ($specialty) {
            return [
                'name' => $specialty->id,
                'label' => $specialty->en_specialty,
            ];
        });

        $ranks = Rank::get()->map(function ($rank) {
            return [
                'name' => $rank->id,
                'label' => $rank->en_rank,
            ];
        });

        return response()->json([
            'categories' => $categories,
            'sectors' => $sectors,
            'specialties' => $specialties,
            'ranks' => $ranks,
        ]);
    }

    public function getShcCategory(Request $request)
    {
        $fieldId = (int) $request->fieldId;
        $specialtyId = (int) $request->specialtyId;
        $rankId = (int) $request->rankId;

        $category = Category::where('sector_id', $fieldId)
            ->where('specialty_id', $specialtyId)
            ->where('rank_id', $rankId)
            ->first();

        return response()->json([
            'category' => $category?->category ?? null,
        ]);
    }

    public function create(CategoryRequest $request)
    {
        $category = Category::create([
            'category' => $request->input('category'),
            'sector_id' => $request->input('sector'),
            'specialty_id' => $request->input('specialty'),
            'rank_id' => $request->input('rank'),
            'created_by' => Auth::id(),
        ]);

        if ($category) {
            return response()->json([
                'message' => 'Category created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create Category. Please try again!',
        ], 500);
    }

    public function edit(CategoryRequest $request, Category $category)
    {
        if ($category) {
            $category->category = $request->input('category');
            $category->sector_id = $request->input('sector');
            $category->specialty_id = $request->input('specialty');
            $category->rank_id = $request->input('rank');
            $category->updated_by = Auth::id();
            $category->save();

            return response()->json([
                'message' => 'Category updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update Category. Please try again!',
        ], 500);
    }

    public function destroy(Category $category)
    {
        if (!$category) {
            return response()->json([
                'error' => 'Category not found.'
            ], 404);
        }

        try {
            Rank::withoutEvents(function () use ($category) {
                $category->delete();
            });
            return response()->json([
                'message' => 'Category deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete category. Please try again later. Details: ' . $e->getMessage(),
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
            $import = new CategoryImport();

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
                'error' => 'Failed to import Saudi Health Council Category. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'category' => 'D01',
                    'en_sector' => 'Dentistry and Related Specialties',
                    'en_specialty' => 'Restorative Dentistry',
                    'en_rank' => 'Consultant',
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
                    return ['category', 'en_sector', 'en_specialty', 'en_rank'];
                }
            };

            return Excel::download($export, 'category_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
