<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuestionRequest;
use App\Imports\QuestionImport;
use App\Models\Domain;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Validator;

class QuestionController extends Controller
{
    public function questions(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'tbcs.created_at'); // default
        $sortDir = $request->input('sort_dir', 'desc');

        // Mapping frontend sort fields to real DB columns
        $sortableMap = [
            'id' => 'questions.id',
            'en_label' => 'questions.en_label',
            'ar_label' => 'questions.ar_label',
        ];

        // Validate sort
        $sortColumn = $sortableMap[$sortBy] ?? 'questions.created_at';

        // Fixed: Handle per_page = -1 for fetching all records
        if ($perPage == -1) {
            $perPage = 999999; // Large number to get all records
        }

        $query = Question::query()->select('questions.*');

        // Optional search
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('questions.en_label', 'like', "%{$search}%")
                    ->orWhere('questions.ar_label', 'like', "%{$search}%")
                    ->orWhere('questions.type', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortColumn, $sortDir);

        // Paginate
        $questions = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform collection - FIXED: Added domain_id to the response
        $questions->getCollection()->transform(function ($question) {
            return [
                'id' => $question->id,
                'en_label' => $question->en_label,
                'en_extra_label' => $question->en_extra_label,
                'ar_label' => $question->ar_label,
                'ar_extra_label' => $question->ar_extra_label,
                'type' => $question->type,
                'options' => json_decode($question->data, true)['options'] ?? [],
                'required' => $question->required,
                'domain_id' => $question->domain_id, // ✅ FIXED: Added missing domain_id
            ];
        });

        $domains = Domain::all()->map(function ($domain) {
            return [
                'id' => $domain->id,
                'label' => $domain->en_label,
                'ar_label' => $domain->ar_label,
                'name' => $domain->name,
            ];
        });

        return response()->json([
            'questions' => $questions,
            'domains' => $domains,
        ]);
    }

    public function create(QuestionRequest $request)
    {
        $question = Question::create([
            'en_label' => $request->input('label'),
            'en_extra_label' => $request->input('en_extra_label', ''),
            'ar_label' => $request->input('ar_label'),
            'ar_extra_label' => $request->input('ar_extra_label', ''),
            'name' => Str::slug($request->input('en_label')),
            'domain_id' => $request->input('domain'),
            'type' => $request->input('type'),
            'data'     => json_encode([
                'options' => $request->input('options', [])
            ]),
        ]);

        if ($question) {
            return response()->json([
                'message' => 'Question created Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create question. Please try again!',
        ], 500);
    }

    public function edit(QuestionRequest $request, Question $question)
    {
        if ($question) {
            $question->en_label = $request->input('label');
            $question->ar_label = $request->input('ar_label');
            $question->en_extra_label = $request->input('en_extra_label', '');
            $question->ar_extra_label = $request->input('ar_extra_label', '');
            $question->type = $request->input('type');
            $question->data = json_encode([
                'options' => $request->input('options', [])
            ]);
            $question->domain_id = $request->input('domain');
            $question->save();

            return response()->json([
                'message' => 'Question updated Successfully !'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update question. Please try again!',
        ], 500);
    }

    public function destroy(Question $question)
    {
        if (!$question) {
            return response()->json([
                'error' => 'Question not found.'
            ], 404);
        }

        try {
            Question::withoutEvents(function () use ($question) {
                $question->delete();
            });
            return response()->json([
                'message' => 'Question deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete question. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function status(Request $request, Question $question)
    {
        info($request->all());
        if ($question) {
            $question->required = $request->input('status');
            $question->save();

            return response()->json([
                'message' => 'Question updated Successfully!'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update question. Please try again!',
        ], 500);
    }

    public function bulkActivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'integer|exists:questions,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid questions IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $questionIds = $request->input('question_ids');

        $this->bulkActivateInActivate($questionIds, 'yes');
    }

    /**
     * Bulk activate users
     */
    public function bulkDeactivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_ids' => 'required|array|min:1',
            'question_ids.*' => 'integer|exists:questions,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid question IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $questionIds = $request->input('question_ids');

        $this->bulkActivateInActivate($questionIds, 'no');
    }

    private function bulkActivateInActivate($questionIds, $status)
    {
        try {
            // Build query with role-based filtering
            $questionQuery = Question::whereIn('id', $questionIds);


            $updatedCount = $questionQuery->update(['required' => $status]);

            return response()->json([
                'message' => "Successfully " . $status . "d {$updatedCount} question(s).",
                'updated_count' => $updatedCount
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to activate question. Please try again later.',
                'details' => $e->getMessage()
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
            $import = new QuestionImport();

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
                'error' => 'Failed to import questions. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'en_label'  => 'Question 1',
                    'en_extra_label' => 'Additional text for question 1',
                    'ar_label'  => 'السؤال 1',
                    'ar_extra_label' => 'نص إضافي للسؤال 1',
                    'type'      => 'radio',
                    'options'   => json_encode([
                        ['en_text' => 'Met', 'ar_text' => 'مستوفى', 'value' => '100'],
                        ['en_text' => 'Partially Met', 'ar_text' => 'مستوفى جزئياً', 'value' => '50'],
                        ['en_text' => 'Not Met', 'ar_text' => 'غير مستوفى', 'value' => '0'],
                    ], JSON_UNESCAPED_UNICODE),
                    'domain_id' => 'Domain for questions',
                ],
                [
                    'en_label'  => 'Question 2',
                    'en_extra_label' => 'Additional text for question 2',
                    'ar_label'  => 'السؤال 2',
                    'ar_extra_label' => 'نص إضافي للسؤال 2',
                    'type'      => 'rating',
                    'options'   => json_encode([
                        ['en_text' => '1', 'ar_text' => '1', 'value' => '20'],
                        ['en_text' => '2', 'ar_text' => '2', 'value' => '40'],
                        ['en_text' => '3', 'ar_text' => '3', 'value' => '60'],
                        ['en_text' => '4', 'ar_text' => '4', 'value' => '80'],
                        ['en_text' => '5', 'ar_text' => '5', 'value' => '100'],
                    ], JSON_UNESCAPED_UNICODE),
                    'domain_id' => 'Domain for questions',
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
                    return ['en_label', 'en_extra_label', 'ar_label', 'ar_extra_label', 'type', 'options', 'domain_id'];
                }
            };

            return \Maatwebsite\Excel\Facades\Excel::download($export, 'questions_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}

