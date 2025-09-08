<?php

namespace App\Http\Controllers;

use App\Http\Requests\CenterSurveyResponseRequest;
use App\Http\Requests\DraftSaveRequest;
use App\Http\Requests\BulkSubmissionRequest;
use App\Models\Answer;
use App\Models\TabularAnswer;
use App\Models\Center;
use App\Models\CenterSurveyResponse;
use App\Utils\SurveySecurityUtils;
use Auth;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

use Illuminate\Routing\Controller as BaseController;

class CenterSurveyResponseController extends BaseController
{
    public function __construct()
    {
        // Apply security middleware to sensitive endpoints
        $this->middleware("survey.security")->only([
            "saveDraft",
            "getDraft",
            "bulkSubmit",
            "updateStatus"
        ]);
    }

    public function getAllSurvey()
    {
        CenterSurveyResponse::expired()->update(["status" => CenterSurveyResponse::STATUS_ENDED]);

        $results = CenterSurveyResponse::with([
            "center.zone",
            "survey",
            "submittedBy",
            "answers"
        ])->get()->map(function ($response) {
            return [
                "id" => $response->id,
                "zoneName"          => $response->center?->zone?->label,
                "centerName"        => $response->center?->label,
                "evaluationSubject" => $response->survey?->title,
                "evaluatorName"     => $response->submittedBy?->name,
                "submittedDate" => $response->submitted_at,
                "status"            => $response->status,
                "completionPercentage" => $response->completion_percentage,
                "score" => $response->answers->sum("score") > 0
                    ? round($response->answers->sum("score") / 100) . "%"
                    : 0,
            ];
        });

        info($results);

        return response()->json([
            "surveys" => $results,
        ]);
    }

    public function getAllSurveyForCenter(Request $request)
    {
        $results = CenterSurveyResponse::with([
            "center.zone",
            "survey",
            "submittedBy",
        ])->where("center_id", $request->input("center_id"))->get()->map(function ($response) {
            return [
                "id" => $response->id,
                "zoneName"          => $response->center?->zone?->label,
                "centerName"        => $response->center?->label,
                "evaluationSubject" => $response->survey?->title,
                "evaluatorName"     => $response->submittedBy?->name,
                "submittedDate" => $response->submitted_at,
                "status"            => $response->status,
                "completionPercentage" => $response->completion_percentage,
                "score" => $response->answers->sum("score") > 0
                    ? round($response->answers->sum("score") / 100) . "%"
                    : 0,
            ];
        });

        return response()->json([
            "surveys" => $results,
        ]);
    }

    public function create(CenterSurveyResponseRequest $request)
    {
        $centerId = $request->input("center");
        $evaluationName = $request->input("evaluation");
        $userId = Auth::id();

        // Check daily submission limit
        if (!SurveySecurityUtils::checkDailySubmissionLimit($userId)) {
            return response()->json([
                "error" => "Daily limit exceeded",
                "message" => "You have reached the daily limit for survey submissions.",
            ], 429);
        }

        $now = Carbon::now();

        // Find the latest existing survey response for the given criteria
        $latestSurvey = CenterSurveyResponse::where("center_id", $centerId)
            ->where("survey_id", $evaluationName)
            ->where("submitted_by", $userId)
            ->where("year", $now->year)
            ->where("month", $now->month)
            ->orderByDesc("evaluation_version")
            ->first();

        $evaluationVersion = 1;
        if ($latestSurvey) {
            // If the latest survey is not completed, increment version for a new one
            if ($latestSurvey->isCompleted()) {
                $evaluationVersion = $latestSurvey->evaluation_version + 1;
            } else {
                // If the latest survey is not completed, resume it
                SurveySecurityUtils::createAuditEntry("survey_resumed", $latestSurvey->id, $userId);
                return response()->json([
                    "message" => "Continue evaluation",
                    "response" => [
                        "id" => $latestSurvey->id,
                        "center_id" => $latestSurvey->center_id,
                        "survey_id" => $latestSurvey->survey_id,
                        "status" => $latestSurvey->status,
                        "submitted_at" => $latestSurvey->submitted_at,
                        "completion_percentage" => $latestSurvey->completion_percentage,
                    ],
                ]);
            }
        }

        try {
            $centerSurveyResponse = CenterSurveyResponse::create([
                "center_id"     => $centerId,
                "survey_id"     => $evaluationName,
                "year"          => $now->year,
                "month"         => $now->month,
                "evaluation_version" => $evaluationVersion, // Use the determined version
                "submitted_by"  => $userId,
                "submitted_at"  => $now,
                "status"        => CenterSurveyResponse::STATUS_STARTED,
            ]);

            SurveySecurityUtils::createAuditEntry("survey_created", $centerSurveyResponse->id, $userId);

            return response()->json([
                "message" => "Evaluation Started Successfully!",
                "response" => [
                    "id" => $centerSurveyResponse->id,
                    "center_id" => $centerSurveyResponse->center_id,
                    "survey_id" => $centerSurveyResponse->survey_id,
                    "status" => $centerSurveyResponse->status,
                    "submitted_at" => $centerSurveyResponse->submitted_at,
                ],
            ], 200);
        } catch (\Exception $e) {
            SurveySecurityUtils::logSecurityEvent("survey_creation_failed", [
                "user_id" => $userId,
                "center_id" => $centerId,
                "survey_id" => $evaluationName,
                "error" => $e->getMessage(),
                "trace" => $e->getTraceAsString(), // Added for debugging
            ]);

            return response()->json([
                "error" => "Unable to Start Evaluation. Please try again!",
                "debug_info" => config("app.debug") ? $e->getMessage() : null, // Only show in debug mode
            ], 500);
        }
    }

    /**
     * Check if a question ID is for tabular data
     */
    private function isTabularQuestionId($questionId)
    {
        return is_string($questionId) && (
            preg_match("/^med_\d+_field_\d+$/", $questionId) ||
            preg_match("/^\d+_\d+$/", $questionId)
        );
    }

    /**
     * Save draft answers for a survey response (Enhanced for tabular data)
     */
    public function saveDraft(DraftSaveRequest $request, $id)
    {
        // Check action rate limit
        // Increased maxAttempts to 120 (from 30) to allow more frequent draft saves
        if (!SurveySecurityUtils::checkActionRateLimit("draft_save", Auth::id(), 60, 120)) {
            return response()->json([
                "error" => "Too many draft save requests. Please wait before trying again.",
            ], 429);
        }

        try {
            $response = $request->survey_response; // Injected by middleware
            $validatedAnswers = $request->getValidatedAnswers();

            // Sanitize answers
            $sanitizedAnswers = array_map(function ($answer) {
                return [
                    "question_id" => $answer["question_id"],
                    "answer" => SurveySecurityUtils::sanitizeAnswerText($answer["answer"]),
                    "score" => $answer["score"] ?? 0,
                ];
            }, $validatedAnswers);

            DB::transaction(function () use ($sanitizedAnswers, $response) {
                // Separate regular answers from tabular answers
                $regularAnswers = [];
                $tabularAnswers = [];
                
                foreach ($sanitizedAnswers as $answerData) {
                    $questionId = $answerData["question_id"];
                    
                    if ($this->isTabularQuestionId($questionId)) {
                        $tabularAnswers[] = [
                            "question_key" => $questionId,
                            "answer_value" => $answerData["answer"] ?? "", // Use 'answer' directly, default to empty string
                            "score" => $answerData["score"] ?? 0, // Use 'score' directly
                        ];
                    } else {
                        $regularAnswers[] = $answerData;
                    }
                }

                // Save regular answers to the answers table
                foreach ($regularAnswers as $answerData) {
                    Answer::createOrUpdateAnswer(
                        $response->id,
                        (int) $answerData["question_id"],
                        $answerData["answer"],
                        $answerData["score"] ?? 0, // Use 'score' directly
                        true // is_draft = true
                    );
                }

                // Save tabular answers to the tabular_answers table
                if (!empty($tabularAnswers)) {
                    TabularAnswer::bulkCreateOrUpdate($response->id, $tabularAnswers, true);
                }

                // Update survey status to draft if it's still in started state
                if ($response->status === CenterSurveyResponse::STATUS_STARTED) {
                    $response->update(["status" => CenterSurveyResponse::STATUS_DRAFT]);
                }
            });

            SurveySecurityUtils::createAuditEntry("draft_saved", $id, Auth::id(), [
                "answer_count" => count($sanitizedAnswers),
                "regular_answers" => count($sanitizedAnswers) - count(array_filter($sanitizedAnswers, function($a) { return $this->isTabularQuestionId($a["question_id"]); })),
                "tabular_answers" => count(array_filter($sanitizedAnswers, function($a) { return $this->isTabularQuestionId($a["question_id"]); })),
            ]);

            return response()->json([
                "message" => "Draft saved successfully.",
                "status" => $response->fresh()->status,
                "saved_count" => count($sanitizedAnswers),
            ]);
        } catch (\Exception $e) {
            SurveySecurityUtils::logSecurityEvent("draft_save_error", [
                "response_id" => $id,
                "user_id" => Auth::id(),
                "error" => $e->getMessage(),
                "trace" => $e->getTraceAsString(),
            ]);

            // Log the specific error for debugging
            \Log::error("Draft save failed", [
                "response_id" => $id,
                "user_id" => Auth::id(),
                "error" => $e->getMessage(),
                "file" => $e->getFile(),
                "line" => $e->getLine(),
            ]);

            return response()->json([
                "error" => "Failed to save draft. Please try again.",
                "debug_info" => config("app.debug") ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Retrieve saved draft answers for a survey response (Enhanced for tabular data)
     */
    public function getDraft($id)
    {
        try {
            $response = CenterSurveyResponse::with("answers")->findOrFail($id);

            // Verify ownership (additional check even with middleware)
            if ($response->submitted_by !== Auth::id()) {
                return response()->json([
                    "error" => "Unauthorized access to this survey response.",
                ], 403);
            }

            $draftAnswers = collect();
            
            // Get regular draft answers
            foreach ($response->answers->where("is_draft", true) as $answer) {
                $draftAnswers->push([
                    "question_id" => $answer->question_id,
                    "answer" => $answer->answer,
                    "score" => $answer->score,
                ]);
            }

            // Get tabular draft answers
            $tabularAnswers = TabularAnswer::where("csr_id", $id)
                                          ->where("is_draft", true)
                                          ->get();
            
            foreach ($tabularAnswers as $tabularAnswer) {
                $draftAnswers->push([
                    "question_id" => $tabularAnswer->question_key,
                    "answer" => $tabularAnswer->answer_value,
                    "score" => $tabularAnswer->score,
                ]);
            }

            SurveySecurityUtils::createAuditEntry("draft_loaded", $id, Auth::id(), [
                "answer_count" => $draftAnswers->count(),
            ]);

            return response()->json([
                "draft_answers" => $draftAnswers->values(),
                "status" => $response->status,
                "last_activity" => $response->last_activity_at,
            ]);
        } catch (\Exception $e) {
            SurveySecurityUtils::logSecurityEvent("draft_load_error", [
                "response_id" => $id,
                "user_id" => Auth::id(),
                "error" => $e->getMessage(),
            ]);

            return response()->json([
                "error" => "Failed to retrieve draft.",
            ], 500);
        }
    }

    /**
     * Submit all answers in bulk and mark survey as completed (Enhanced for tabular data)
     */
    public function bulkSubmit(BulkSubmissionRequest $request, $id)
    {
        // Check daily submission limit
        if (!SurveySecurityUtils::checkDailySubmissionLimit(Auth::id())) {
            return response()->json([
                "error" => "Daily submission limit exceeded.",
            ], 429);
        }

        // Check for duplicate submission
        if (SurveySecurityUtils::checkDuplicateLimit("survey_submit", Auth::id(), 1, 60)) { // 1 submission per minute
            return response()->json([
                "error" => "This survey has already been submitted or you are submitting too frequently.",
            ], 429);
        }

        try {
            $response = $request->survey_response; // Injected by middleware
            $validatedAnswers = $request->getValidatedAnswers();

            DB::transaction(function () use ($validatedAnswers, $response) {
                // Clear existing answers to ensure clean bulk submission
                Answer::where("csr_id", $response->id)->delete();
                TabularAnswer::where("csr_id", $response->id)->delete();

                // Separate regular answers from tabular answers
                $regularAnswers = [];
                $tabularAnswers = [];
                
                foreach ($validatedAnswers as $answerData) {
                    $questionId = $answerData["question_id"];
                    
                    if ($this->isTabularQuestionId($questionId)) {
                        $tabularAnswers[] = [
                            "question_key" => $questionId,
                            "answer_value" => $answerData["answer"] ?? "", // Use 'answer' directly, default to empty string
                            "score" => $answerData["score"] ?? 0, // Use 'score' directly
                        ];
                    } else {
                        $regularAnswers[] = $answerData;
                    }
                }

                // Insert regular answers
                $answersData = [];
                foreach ($regularAnswers as $answerData) {
                    $answersData[] = [
                        "csr_id" => $response->id,
                        "question_id" => (int) $answerData["question_id"],
                        "answer" => $answerData["answer"],
                        "score" => $answerData["score"] ?? 0, // Use 'score' directly
                        "is_draft" => false,
                        "created_at" => now(),
                        "updated_at" => now(),
                    ];
                }

                if (!empty($answersData)) {
                    Answer::insert($answersData);
                }

                // Insert tabular answers
                if (!empty($tabularAnswers)) {
                    TabularAnswer::bulkCreateOrUpdate($response->id, $tabularAnswers, false);
                }

                // Calculate overall score (from both regular and tabular answers)
                $regularScore = collect($regularAnswers)->sum("score");
                $tabularScore = collect($tabularAnswers)->sum("score");
                $overallScore = $regularScore + $tabularScore;

                // Update survey response status and overall score
                $response->update([
                    "status" => CenterSurveyResponse::STATUS_COMPLETED,
                    "overall_score" => $overallScore,
                    "submitted_at" => now(),
                ]);
            });

            // Increment daily submission counter
            SurveySecurityUtils::incrementDailySubmissions(Auth::id());

            SurveySecurityUtils::createAuditEntry("survey_submitted", $id, Auth::id(), [
                "answer_count" => count($validatedAnswers),
                "overall_score" => $response->fresh()->overall_score,
            ]);

            return response()->json([
                "message" => "Survey submitted successfully!",
                "status" => CenterSurveyResponse::STATUS_COMPLETED,
                "overall_score" => $response->fresh()->overall_score,
                "submitted_answers" => count($validatedAnswers),
            ]);
        } catch (\Exception $e) {
            SurveySecurityUtils::logSecurityEvent("submission_error", [
                "response_id" => $id,
                "user_id" => Auth::id(),
                "error" => $e->getMessage(),
                "trace" => $e->getTraceAsString(), // Added for debugging
            ]);

            // Log the specific error for debugging
            \Log::error("Submission failed", [
                "response_id" => $id,
                "user_id" => Auth::id(),
                "error" => $e->getMessage(),
                "file" => $e->getFile(),
                "line" => $e->getLine(),
            ]);

            return response()->json([
                "error" => "Failed to submit survey. Please try again.",
                "debug_info" => config("app.debug") ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            "status" => "required|string|in:" . implode(",", CenterSurveyResponse::getAvailableStatuses()),
        ]);

        try {
            $response = CenterSurveyResponse::findOrFail($id);

            // Verify ownership
            if ($response->submitted_by !== Auth::id()) {
                return response()->json([
                    "error" => "Unauthorized access to this survey response.",
                ], 403);
            }

            $newStatus = $request->input("status");

            // Prevent status changes on completed surveys
            if (!$response->canBeModified()) {
                return response()->json([
                    "error" => "Cannot change status of a completed survey.",
                ], 422);
            }

            $oldStatus = $response->status;
            $response->update(["status" => $newStatus]);

            SurveySecurityUtils::createAuditEntry("status_updated", $id, Auth::id(), [
                "old_status" => $oldStatus,
                "new_status" => $newStatus,
            ]);

            return response()->json([
                "message" => "Status updated successfully.",
                "status" => $response->status,
            ]);
        } catch (\Exception $e) {
            SurveySecurityUtils::logSecurityEvent("status_update_error", [
                "response_id" => $id,
                "user_id" => Auth::id(),
                "error" => $e->getMessage(),
            ]);

            return response()->json([
                "error" => "Failed to update status.",
            ], 500);
        }
    }

    public function progress($id)
    {
        try {
            $response = CenterSurveyResponse::with([
                "survey.section.domains.questions",
                "answers"
            ])->findOrFail($id);

            // Verify ownership
            if ($response->submitted_by !== Auth::id()) {
                return response()->json([
                    "error" => "Unauthorized access to this survey response.",
                ], 403);
            }

            $totalQuestions = $response->getTotalQuestionsCount();
            $regularAnswers = $response->answers()->count();
            $tabularAnswers = TabularAnswer::where("csr_id", $id)->count();
            $totalAnswered = $regularAnswers + $tabularAnswers;
            
            $completionPercent = $totalQuestions > 0 ? ($regularAnswers / $totalQuestions) * 100 : 0;

            return response()->json([
                "completion_percent" => round($completionPercent, 2),
                "total_questions" => $totalQuestions,
                "answered_questions" => $regularAnswers,
                "tabular_answers" => $tabularAnswers,
                "total_answered" => $totalAnswered,
                "status" => $response->status,
                "last_activity" => $response->last_activity_at,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "error" => "Failed to retrieve progress.",
            ], 500);
        }
    }

    /**
     * Get medication data for dashboard reporting
     */
    public function getMedicationData($id)
    {
        try {
            $response = CenterSurveyResponse::findOrFail($id);

            // Verify ownership
            if ($response->submitted_by !== Auth::id()) {
                return response()->json([
                    "error" => "Unauthorized access to this survey response.",
                ], 403);
            }

            $medicationData = TabularAnswer::getMedicationDataForResponse($id, false);
            $simpleTabularData = TabularAnswer::getSimpleTabularDataForResponse($id, false);

            return response()->json([
                "medication_data" => $medicationData,
                "simple_tabular_data" => $simpleTabularData,
                "response_id" => $id,
                "status" => $response->status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "error" => "Failed to retrieve medication data.",
            ], 500);
        }
    }
}