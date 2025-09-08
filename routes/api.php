<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CenterController;
use App\Http\Controllers\CenterSurveyResponseController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\DynamicTableController;
use App\Http\Controllers\EltController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\TbcController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ZoneController;
use Illuminate\Support\Facades\Route;

// ✅ Public routes (must use 'web' for session-based auth)
Route::middleware('web')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');
});

// ✅ Protected routes (must include 'web' + 'auth:sanctum')
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'permissions'])->name('permissions')->middleware('permission:access-permission-module');
    Route::post('/permissions/create', [PermissionController::class, 'create'])->name('permissions.create');
    Route::put('/permissions/edit/{id}', [PermissionController::class, 'edit'])->name('permissions.edit');
    Route::delete('/permissions/delete/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    // Roles
    Route::get('/roles', [RoleController::class, 'roles'])->name('roles')->middleware('permission:access-role-module');
    Route::post('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::put('/roles/edit/{role}', [RoleController::class, 'edit'])->name('roles.edit');
    Route::delete('/roles/delete/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    // Users
    Route::get('/users', [UserController::class, 'users'])->name('users')->middleware('permission:access-user-module');
    Route::post('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::put('/users/edit/{user}', [UserController::class, 'edit'])->name('users.edit');
    Route::delete('/users/delete/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::put('/users/{user}/status', [UserController::class, 'status'])->name('users.status');
    Route::put('/users/bulk-activate', [UserController::class, 'bulkActivate']);
    Route::put('/users/bulk-deactivate', [UserController::class, 'bulkDeactivate']);
    Route::post('/users/import', [UserController::class, 'import'])->name('users.import');
    Route::get('/users/download-template', [UserController::class, 'downloadTemplate'])->name('users.download-template');
    Route::put("users/{user}/assign-tbc", [UserController::class, "assignTbc"]);
    Route::get("centers/{center}/tbcs", [UserController::class, "getTbcsByCenter"]);

    // Elts
    Route::get('/elts', [EltController::class, 'elts'])->name('elts')->middleware('permission:access-elt-module');
    Route::post('/elts/create', [EltController::class, 'create'])->name('elts.create');
    Route::put('/elts/edit/{elt}', [EltController::class, 'edit'])->name('elts.edit');
    Route::delete('/elts/delete/{elt}', [EltController::class, 'destroy'])->name('elts.destroy');

    // Zones
    Route::get('/zones', [ZoneController::class, 'zones'])->name('zones')->middleware('permission:access-zone-module');
    Route::post('/zones/create', [ZoneController::class, 'create'])->name('zones.create');
    Route::put('/zones/edit/{zone}', [ZoneController::class, 'edit'])->name('zones.edit');
    Route::delete('/zones/delete/{zone}', [ZoneController::class, 'destroy'])->name('zones.destroy');

    // Primary Health Care
    Route::get('/centers', [CenterController::class, 'centers'])->name('centers')->middleware('permission:access-center-module');
    Route::post('/centers/create', [CenterController::class, 'create'])->name('centers.create');
    Route::put('/centers/edit/{center}', [CenterController::class, 'edit'])->name('centers.edit');
    Route::delete('/centers/delete/{center}', [CenterController::class, 'destroy'])->name('centers.destroy');
    Route::put('/centers/{center}/status', [CenterController::class, 'status'])->name('centers.status');
    Route::put('/centers/bulk-activate', [CenterController::class, 'bulkActivate']);
    Route::put('/centers/bulk-deactivate', [CenterController::class, 'bulkDeactivate']);
    Route::post('/centers/import', [CenterController::class, 'import'])->name('centers.import');
    Route::get('/centers/download-template', [CenterController::class, 'downloadTemplate'])->name('centers.download-template');
    Route::post('/centers/{center}/assign-team-codes', [CenterController::class, 'assignTeamCodes']);
    Route::get('/centers/team-based-codes', [CenterController::class, 'getTeamBasedCodes']);
    Route::get('/centers/{center}/team-codes', [CenterController::class, 'getAssignedTeamCodes']);

    // Team Based Code (TBC)
    Route::get('/tbcs', [TbcController::class, 'tbcs'])->name('tbcs')->middleware('permission:access-tbc-module');
    Route::post('/tbcs/create', [TbcController::class, 'create'])->name('tbcs.create');
    Route::put('/tbcs/edit/{tbc}', [TbcController::class, 'edit'])->name('tbcs.edit');
    Route::delete('/tbcs/delete/{tbc}', [TbcController::class, 'destroy'])->name('tbcs.destroy');
    Route::post('/tbcs/import', [TbcController::class, 'import'])->name('tbcs.import');
    Route::get('/tbcs/download-template', [TbcController::class, 'downloadTemplate'])->name('tbcs.download-template');

    //Sections
    Route::get('/sections', [SectionController::class, 'sections'])->name('sections')->middleware('permission:access-section-module');
    Route::post('/sections/create', [SectionController::class, 'create'])->name('sections.create');
    Route::put('/sections/edit/{section}', [SectionController::class, 'edit'])->name('sections.edit');
    Route::delete('/sections/delete/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
    Route::post('/sections/import', [SectionController::class, 'import'])->name('sections.import');
    Route::get('/sections/download-template', [SectionController::class, 'downloadTemplate'])->name('sections.download-template');
    Route::get('/sections/tabular', [SectionController::class, 'getTabularSections'])->name('sections.tabular-section');

    // Domains
    Route::get('/domains', [DomainController::class, 'domains'])->name('domains')->middleware('permission:access-domain-module');
    Route::post('/domains/create', [DomainController::class, 'create'])->name('domains.create');
    Route::put('/domains/edit/{domain}', [DomainController::class, 'edit'])->name('domains.edit');
    Route::delete('/domains/delete/{domain}', [DomainController::class, 'destroy'])->name('domains.destroy');
    Route::put('/domains/{domain}/status', [DomainController::class, 'status'])->name('domains.status');
    Route::put('/domains/bulk-activate', [DomainController::class, 'bulkActivate']);
    Route::put('/domains/bulk-deactivate', [DomainController::class, 'bulkDeactivate']);
    Route::post('/domains/import', [DomainController::class, 'import'])->name('domains.import');
    Route::get('/domains/download-template', [DomainController::class, 'downloadTemplate'])->name('domains.download-template');
    Route::put('/domains/{domain}/assign-section', [DomainController::class, 'assignSection'])->name('domains.assign-section');

    // Questions
    Route::get('/questions', [QuestionController::class, 'questions'])->name('questions')->middleware('permission:access-question-module');
    Route::post('/questions/create', [QuestionController::class, 'create'])->name('questions.create');
    Route::put('/questions/edit/{question}', [QuestionController::class, 'edit'])->name('questions.edit');
    Route::delete('/questions/delete/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    Route::put('/questions/{question}/status', [QuestionController::class, 'status'])->name('questions.status');
    Route::put('/questions/bulk-activate', [QuestionController::class, 'bulkActivate']);
    Route::put('/questions/bulk-deactivate', [QuestionController::class, 'bulkDeactivate']);
    Route::post('/questions/import', [QuestionController::class, 'import'])->name('questions.import');
    Route::get('/questions/download-template', [QuestionController::class, 'downloadTemplate'])->name('questions.download-template');

    // Evaluations
    Route::get('/evaluations', [EvaluationController::class, 'evaluations'])->name('evaluations')->middleware('permission:access-evaluation-module');
    Route::post('/evaluations/create', [EvaluationController::class, 'create'])->name('evaluations.create');
    Route::put('/evaluations/edit/{survey}', [EvaluationController::class, 'edit'])->name('evaluations.edit');
    Route::delete('/evaluations/delete/{survey}', [EvaluationController::class, 'destroy'])->name('evaluations.destroy');
    Route::put('/evaluations/{survey}/status', [EvaluationController::class, 'status'])->name('evaluations.status');
    Route::put('/evaluations/bulk-activate', [EvaluationController::class, 'bulkActivate']);
    Route::put('/evaluations/bulk-deactivate', [EvaluationController::class, 'bulkDeactivate']);
    Route::post('/evaluations/import', [EvaluationController::class, 'import'])->name('evaluations.import');
    Route::get('/evaluations/download-template', [EvaluationController::class, 'downloadTemplate'])->name('evaluations.download-template');
    Route::get('/evaluations/evaluations-list', [EvaluationController::class, 'evaluationsList'])->name('evaluations.evaluations-list');
    Route::get('/evaluations/{section}/{evaluation}', [EvaluationController::class, 'getQuestionsBySectionAndEvaluation'])->name('evaluations.getQuestionsBySectionAndEvaluation');
    Route::get('/evaluations/getFormData', [EvaluationController::class, 'getFormData'])->name('evaluations.getFormData');
    Route::get("/evaluations/centers-by-zone", [EvaluationController::class, "getCentersByZone"]);
    Route::get("/evaluations/evaluations-by-section", [EvaluationController::class, "getEvaluationsBySection"]);

    //Center Survey Response - Enhanced with new endpoints
    Route::get('/evaluations/getAllSurveyForCenter', [CenterSurveyResponseController::class, 'getAllSurveyForCenter'])->name('evaluation.getAllSurveyForCenter');
    Route::get('/evaluations/getAllSurvey', [CenterSurveyResponseController::class, 'getAllSurvey'])->name('evaluation.getAllSurvey');
    Route::post('/evaluations/centerSurveyResponse/create', [CenterSurveyResponseController::class, 'create'])->name('evaluation.centerSurveyResponse.create');
    Route::patch('/evaluations/{id}', [CenterSurveyResponseController::class, 'updateStatus']);
    Route::get('/responses/{id}/progress', [CenterSurveyResponseController::class, 'progress']);

    // NEW ENDPOINTS FOR DRAFT SAVING AND BULK SUBMISSION
    // Draft management endpoints
    Route::post('/responses/{id}/draft', [CenterSurveyResponseController::class, 'saveDraft'])
        ->name('responses.saveDraft')
        ->middleware('throttle:60,1'); // Rate limit: 30 requests per minute

    Route::get('/responses/{id}/draft', [CenterSurveyResponseController::class, 'getDraft'])
        ->name('responses.getDraft');

    // Bulk submission endpoint
    Route::post('/responses/{id}/submit', [CenterSurveyResponseController::class, 'bulkSubmit'])
        ->name('responses.bulkSubmit')
        ->middleware('throttle:10,1'); //   limit: 5 requests per minute

    // Additional utility endpoints
    Route::get('/responses/{id}/statistics', function ($id) {
        $response = \App\Models\CenterSurveyResponse::findOrFail($id);

        // Verify ownership
        if ($response->submitted_by !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $stats = \App\Models\Answer::getResponseStatistics($id);
        $stats['completion_percentage'] = $response->completion_percentage;
        $stats['status'] = $response->status;
        $stats['can_be_modified'] = $response->canBeModified();

        return response()->json($stats);
    })->name('responses.statistics');

    // Endpoint to check if user has resumable surveys
    Route::get('/evaluations/resumable', function (Request $request) {
        $centerId = $request->input('center_id');
        $surveyId = $request->input('survey_id');

        if (!$centerId || !$surveyId) {
            return response()->json(['error' => 'center_id and survey_id are required'], 400);
        }

        $resumable = \App\Models\CenterSurveyResponse::resumable($centerId, $surveyId, Auth::id())->first();

        return response()->json([
            'has_resumable' => $resumable !== null,
            'response' => $resumable ? [
                'id' => $resumable->id,
                'status' => $resumable->status,
                'completion_percentage' => $resumable->completion_percentage,
                'last_activity_at' => $resumable->last_activity_at,
            ] : null,
        ]);
    })->name('evaluations.resumable');

    // Endpoint to clean up expired drafts (admin only)
    Route::post('/admin/cleanup-expired-drafts', function () {
        $expiredCount = \App\Models\CenterSurveyResponse::expired()->update(['status' => 'ended']);

        return response()->json([
            'message' => "Marked {$expiredCount} expired responses as ended.",
            'expired_count' => $expiredCount,
        ]);
    })->name('admin.cleanupExpiredDrafts')->middleware('permission:access-admin-module');

    // Dynamic Table
    Route::post('/dynamic-tables', [DynamicTableController::class, 'store'])->name('dynamic-table');

    // Medications
    Route::get('/medications', [MedicationController::class, 'medications'])->name('medications')->middleware('permission:access-medication-module');
    Route::post('/medications/create', [MedicationController::class, 'create'])->name('medications.create');
    Route::put('/medications/edit/{medication}', [MedicationController::class, 'edit'])->name('medications.edit');
    Route::delete('/medications/delete/{medication}', [MedicationController::class, 'destroy'])->name('medications.destroy');
    Route::post('/medications/import', [MedicationController::class, 'import'])->name('medications.import');
    Route::get('/medications/download-template', [MedicationController::class, 'downloadTemplate'])->name('medications.download-template');
    Route::get('/evaluations/medications', [MedicationController::class, 'getMedications'])->name('evaluations.medications');
    Route::get('/evaluations/headers', [MedicationController::class, 'getHeaders'])->name('evaluations.headers');

    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});
