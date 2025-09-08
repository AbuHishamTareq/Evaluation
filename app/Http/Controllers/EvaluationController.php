<?php

namespace App\Http\Controllers;

use App\Http\Requests\EvaluationRequest;
use App\Imports\EvaluationImport;
use App\Models\Center;
use App\Models\Domain;
use App\Models\Role;
use App\Models\Section;
use App\Models\Survey;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class EvaluationController extends Controller
{
    public function evaluations(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = $request->input('search');
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $sortableMap = [
            'id' => 'id',
            'title' => 'title',
            'ar_label' => 'ar_label',
            'section_name' => 'section_id',
            'created_at' => 'created_at',
        ];

        $sortColumn = $sortableMap[$sortBy] ?? 'created_at';

        if ($perPage == -1) {
            $perPage = 100000;
        }

        $evaluationQuery = Survey::with(['section', 'roles'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('ar_label', 'like', "%{$search}%")
                        ->orWhereHas('section', fn($z) => $z->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderBy($sortColumn, $sortDir);

        $evaluations = $evaluationQuery->paginate($perPage, ['*'], 'page', $page);

        $evaluations->getCollection()->transform(function ($evaluation) {
            return [
                'id' => $evaluation->id,
                'title' => $evaluation->title,
                'ar_label' => $evaluation->ar_label,
                'en_description' => $evaluation->en_description,
                'ar_description' => $evaluation->ar_description,
                'section_id' => $evaluation->section_id,
                'section_name' => $evaluation->section->en_label ?? '',
                'status' => $evaluation->status,
                'image' => $evaluation->image ? url($evaluation->image) : null,
                'roles' => $evaluation->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'label' => $role->label ?? $role->name,
                    ];
                }),
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

        $authUser = Auth::user();
        $authUserRole = $authUser->roles->first()?->name;

        // Load roles list
        $roleQuery = Role::query();
        if ($authUserRole === 'admin') {
            $roleQuery->where('name', '!=', 'super-admin');
        } elseif ($authUserRole !== 'super-admin') {
            $roleQuery->whereNotIn('name', ['super-admin', 'admin']);
        }

        $roles = $roleQuery->get();

        return response()->json([
            'evaluations' => $evaluations,
            'roles' => $roles,
            'sections' => $sections,
        ]);
    }

    public function create(EvaluationRequest $request)
    {
        $sectionSlug = $request->input('section');

        // Check if an evaluation already exists for this section slug
        $exists = Survey::where('section_id', $sectionSlug)->exists();

        if ($exists) {
            return response()->json([
                'error' => 'An evaluation for this section already exists.',
            ], 409); // 409 Conflict
        }

        // Prepare image path if image is provided
        $imagePath = null;
        if ($request->has('image') && $request->input('image')) {
            $imagePath = $this->saveImage($request->input('image'));
        }

        // Create new evaluation
        $evaluation = Survey::create([
            'title' => $request->input('title'),
            'ar_label' => $request->input('ar_label'),
            'en_description' => $request->input('en_description'),
            'ar_description' => $request->input('ar_description'),
            'section_id' => $sectionSlug,
            'created_by' => Auth::id(),
            'name' => Str::slug($request->input('title')),
            'image' => $imagePath,
        ]);

        // Sync roles if provided
        if ($request->has('role')) {
            $evaluation->roles()->sync($request->input('role'));
        }

        if ($evaluation) {
            return response()->json([
                'message' => 'Evaluation created successfully!',
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to create evaluation. Please try again!',
        ], 500);
    }


    public function edit(EvaluationRequest $request, Survey $survey)
    {
        // Check if the survey exists (optional safety check)
        if (!$survey) {
            return response()->json([
                'error' => 'Evaluation not found.',
            ], 404);
        }

        // Handle image logic
        $imageInput = $request->input('image');

        if ($imageInput && Str::startsWith($imageInput, 'data:image')) {
            // Save new base64 image
            $relativePath = $this->saveImage($imageInput);
            $request['image'] = $relativePath;

            // Delete old image file
            if ($survey->image) {
                $absolutePath = public_path($survey->image);
                if (File::exists($absolutePath)) {
                    File::delete($absolutePath);
                }
            }

            $survey->image = $relativePath;
        }

        // Update other survey fields
        $survey->title = $request->input('title');
        $survey->ar_label = $request->input("ar_label");
        $survey->en_description = $request->input("en_description");
        $survey->ar_description = $request->input("ar_description");
        $survey->section_id = $request->input("section");

        // Only update image if not already done above
        if (!$imageInput || !Str::startsWith($imageInput, 'data:image')) {
            // Keep old image (no change)
            $survey->image = $survey->image;
        }

        $survey->save();

        // Sync roles if provided
        if ($request->has("role")) {
            $survey->roles()->sync($request->input("role"));
        } else {
            // If no roles are provided, detach all existing roles
            $survey->roles()->detach();
        }

        return response()->json([
            'message' => 'Evaluation updated successfully!',
        ], 200);
    }

    public function destroy(Survey $survey)
    {
        if (!$survey) {
            return response()->json([
                'error' => 'Evaluation not found.'
            ], 404);
        }

        try {
            if ($survey->image) {
                $absolutePath = public_path($survey->image);
                File::delete($absolutePath);
            }

            Survey::withoutEvents(function () use ($survey) {
                $survey->roles()->detach();
                $survey->delete();
            });
            return response()->json([
                'message' => 'Evaluation deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete evaluation. Please try again later. Details: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function status(Request $request, Survey $survey)
    {
        if ($survey) {
            $survey->status = $request->input('status');
            $survey->save();

            return response()->json([
                'message' => 'Evaluation updated Successfully!'
            ], 200);
        }

        return response()->json([
            'error' => 'Unable to update evaluation. Please try again!',
        ], 500);
    }

    public function bulkActivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'evaluation_ids' => 'required|array|min:1',
            'evaluation_ids.*' => 'integer|exists:surveys,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid Evaluation IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $evaluationIds = $request->input('evaluation_ids');

        $this->bulkActivateInActivate($evaluationIds, 'active');
    }

    public function bulkDeactivate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'evaluation_ids' => 'required|array|min:1',
            'evaluation_ids.*' => 'integer|exists:surveys,id'
        ]);


        if ($validator->fails()) {
            return response()->json([
                'error' => 'Invalid Evaluation IDs provided.',
                'details' => $validator->errors()
            ], 422);
        }

        $evaluationIds = $request->input('evaluation_ids');

        $this->bulkActivateInActivate($evaluationIds, 'inactive');
    }

    private function bulkActivateInActivate($evaluationIds, $status)
    {
        try {
            $evaluationQuery = Survey::whereIn('id', $evaluationIds);


            $updatedCount = $evaluationQuery->update(['status' => $status]);

            return response()->json([
                'message' => "Successfully " . $status . "d {$updatedCount} evaluation(s).",
                'updated_count' => $updatedCount
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to activate evaluation(s). Please try again later.',
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
            $import = new EvaluationImport();

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
                'error' => 'Failed to import evaluations. Please check your file format and try again.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate()
    {
        try {
            $sampleData = [
                [
                    'title' => 'Test example for Evaluation subject',
                    'ar_label' => 'مثال على عنوان التقييم',
                    'section_id' => 'Test Section',
                    'roles' => 'admin,editor,user',
                ],
                [
                    'title' => 'Test example for Evaluation subject',
                    'ar_label' => 'مثال على عنوان التقييم',
                    'section_id' => 'Test Section',
                    'roles' => 'admin',
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
                    return ["title", "ar_label", "section_id", "roles"];
                }
            };

            return Excel::download($export, 'evaluations_import_template.xlsx');
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate template file.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function evaluationsList()
    {
        $user = Auth::user();

        // Get the user's role IDs
        $roleIds = $user->roles()->pluck('id');

        // Fetch only surveys assigned to those roles
        $evaluationsList = Survey::with('section')
            ->where('status', 'active')
            ->whereHas('roles', function ($query) use ($roleIds) {
                $query->whereIn('roles.id', $roleIds);
            })
            ->orderBy('section_id')
            ->get();

        return response()->json([
            'evaluationsList' => $evaluationsList,
        ]);
    }

    private function saveImage($image)
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);

            $type = strtolower($type[1]);

            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('Invalid image type');
            }

            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if ($image === false) {
                throw new \Exception('Base64 decode failed');
            }
        } else {
            throw new \Exception('Did not match data URI with image data');
        }

        $dir = 'images/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;

        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }

        file_put_contents($absolutePath . '/' . $file, $image);

        return $relativePath;
    }

    public function getQuestionsBySectionAndEvaluation($section, $evaluation)
    {
        $survey = Survey::with('section')->where('name', $evaluation)->first();

        if (!$survey) {
            return response()->json(['error' => 'Survey not found'], 404);
        }

        $sectionList = $survey->section;

        if (!$sectionList) {
            return response()->json(['error' => 'Section not found for this survey'], 404);
        }

        $sectionWithDomains = Section::with('domains.questions')->where('name', $section)->first();

        if (!$sectionWithDomains) {
            return response()->json(['error' => 'Section with given name not found'], 404);
        }

        return response()->json([
            'survey_section' => $sectionList,
            'queried_section' => $sectionWithDomains->only(['id', 'name', 'en_label', 'ar_label']),
            'domains' => $sectionWithDomains->domains->map(function ($domain) {
                return [
                    'id' => $domain->id,
                    'name' => $domain->name,
                    'en_label' => $domain->en_label,
                    'ar_label' => $domain->ar_label,
                    'questions' => $domain->questions->map(function ($question) {
                        return [
                            'id' => $question->id,
                            'question' => $question->en_label ?? $question->question ?? '',
                            'extra_question' => $question->en_extra_label ?? $question->en_extra_label ?? '',
                            'type' => $question->type,
                            'required' => $question->required,
                            'options' => json_decode($question->data, true)['options'] ?? [],
                        ];
                    }),
                ];
            }),
        ]);
    }

    public function getFormData() {
        $user = Auth::user();
        
        // Get zones - if user has center_id, get only their zone
        if ($user->center_id) {
            // Find the user's center and get its zone
            $userCenter = Center::where('name', $user->center_id)->first();
            if ($userCenter) {
                $zones = Zone::where('name', $userCenter->zone_id)->select('label', 'name')->get();
            } else {
                $zones = collect(); // Empty collection if center not found
            }
        } else {
            $zones = Zone::select('label', 'name')->get();
        }
        
        // Get centers - if user has center_id, get only their center
        if ($user->center_id) {
            $centers = Center::where('name', $user->center_id)->select('label', 'name', 'zone_id')->get();
        } else {
            $centers = Center::select('label', 'name', 'zone_id')->get();
        }
        
        $sections = Section::select('en_label', 'name')->get();
        $evaluations = Survey::select('title', 'name', 'section_id')->get();

        return response()->json([
            'zones' => $zones,
            'centers' => $centers,
            'sections' => $sections,
            'evaluations' => $evaluations,
            'user' => [
                'center_id' => $user->center_id,
                'name' => $user->name,
            ]
        ]);
    }

    /**
     * Get centers filtered by zone
     */
    public function getCentersByZone(Request $request)
    {
        $zoneName = $request->input('zone');
        
        if (!$zoneName) {
            return response()->json([
                'error' => 'Zone parameter is required'
            ], 400);
        }

        $centers = Center::where('zone_id', $zoneName)
            ->select('label', 'name', 'zone_id')
            ->get();

        return response()->json([
            'centers' => $centers
        ]);
    }

    /**
     * Get evaluations filtered by section
     */
    public function getEvaluationsBySection(Request $request)
    {
        $sectionName = $request->input('section');
        
        if (!$sectionName) {
            return response()->json([
                'error' => 'Section parameter is required'
            ], 400);
        }

        $evaluations = Survey::where('section_id', $sectionName)
            ->select('title', 'name', 'section_id')
            ->get();

        return response()->json([
            'evaluations' => $evaluations
        ]);
    }
}