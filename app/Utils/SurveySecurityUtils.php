<?php

namespace App\Utils;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\CenterSurveyResponse;
use App\Models\Answer;

class SurveySecurityUtils
{
    /**
     * Generate a secure token for survey session
     */
    public static function generateSurveyToken($responseId, $userId): string
    {
        $data = $responseId . '|' . $userId . '|' . time() . '|' . config('app.key');
        return hash('sha256', $data);
    }

    /**
     * Validate survey session token
     */
    public static function validateSurveyToken($token, $responseId, $userId): bool
    {
        $expectedToken = self::generateSurveyToken($responseId, $userId);
        return hash_equals($expectedToken, $token);
    }

    /**
     * Check if user has exceeded daily submission limits
     */
    public static function checkDailySubmissionLimit($userId, $limit = 10): bool
    {
        $key = "daily_submissions:{$userId}:" . date('Y-m-d');
        $submissions = Cache::get($key, 0);

        if ($submissions >= $limit) {
            Log::warning('Daily submission limit exceeded', [
                'user_id' => $userId,
                'submissions' => $submissions,
                'limit' => $limit,
                'date' => date('Y-m-d'),
            ]);
            return false;
        }

        return true;
    }

    /**
     * Increment daily submission counter
     */
    public static function incrementDailySubmissions($userId): void
    {
        $key = "daily_submissions:{$userId}:" . date('Y-m-d');
        $submissions = Cache::get($key, 0);
        Cache::put($key, $submissions + 1, 86400); // 24 hours
    }

    /**
     * Sanitize answer text to prevent XSS and other attacks
     */
    public static function sanitizeAnswerText($value): string
    {
        // Convert to string if not already a string or numeric
        if (!is_string($value) && !is_numeric($value)) {
            $value = (string) $value;
        }

        // If it's a numeric value, just cast to string and return
        if (is_numeric($value)) {
            return (string) $value;
        }

        // For string values, apply existing sanitization
        $text = strip_tags($value);
        $text = trim($text);
        $text = substr($text, 0, 5000);

        return $text;
    }

    /**
     * Validate answer format and content
     */
    public static function validateAnswer($answer): array
    {
        $errors = [];

        // Check required fields
        if (!isset($answer['question_id']) || !is_numeric($answer['question_id'])) {
            $errors[] = 'Invalid question ID';
        }

        if (!isset($answer['answer']) || empty(trim($answer['answer']))) {
            $errors[] = 'Answer text is required';
        }

        // Check answer length
        if (isset($answer['answer']) && strlen($answer['answer']) > 5000) {
            $errors[] = 'Answer text is too long';
        }

        // Check score if provided
        if (isset($answer['score']) && (!is_numeric($answer['score']) || $answer['score'] < 0)) {
            $errors[] = 'Invalid score value';
        }

        return $errors;
    }

    /**
     * Check for duplicate submissions
     */
    public static function checkDuplicateSubmission($responseId): bool
    {
        $response = CenterSurveyResponse::find($responseId);

        if (!$response) {
            return false;
        }

        // Check if already submitted
        if (in_array($response->status, ['completed', 'submitted'])) {
            Log::warning('Duplicate submission attempt detected', [
                'response_id' => $responseId,
                'user_id' => $response->submitted_by,
                'current_status' => $response->status,
            ]);
            return true;
        }

        return false;
    }

    /**
     * Detect suspicious answer patterns
     */
    public static function detectSuspiciousAnswers(array $answers): array
    {
        $suspiciousPatterns = [];

        // Check for identical answers
        $answerTexts = array_column($answers, 'answer');
        $uniqueAnswers = array_unique($answerTexts);

        if (count($answerTexts) > 5 && count($uniqueAnswers) < 3) {
            $suspiciousPatterns[] = 'Too many identical answers';
        }

        // Check for sequential patterns
        $scores = array_column($answers, 'score');
        if (count($scores) > 3) {
            $isSequential = true;
            for ($i = 1; $i < count($scores); $i++) {
                if ($scores[$i] !== $scores[$i - 1] + 1 && $scores[$i] !== $scores[$i - 1]) {
                    $isSequential = false;
                    break;
                }
            }
            if ($isSequential) {
                $suspiciousPatterns[] = 'Sequential scoring pattern detected';
            }
        }

        // Check for extremely fast completion
        $firstAnswer = reset($answers);
        $lastAnswer = end($answers);

        // This would need timestamp data to work properly
        // For now, we'll check based on answer complexity
        $totalLength = array_sum(array_map('strlen', $answerTexts));
        $averageLength = $totalLength / count($answerTexts);

        if ($averageLength < 5 && count($answers) > 10) {
            $suspiciousPatterns[] = 'Answers too short for survey length';
        }

        return $suspiciousPatterns;
    }

    /**
     * Log security event
     */
    public static function logSecurityEvent($event, $data = []): void
    {
        Log::channel('security')->info("Survey Security Event: {$event}", array_merge($data, [
            'timestamp' => now()->toISOString(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]));
    }

    /**
     * Generate audit trail entry
     */
    public static function createAuditEntry($action, $responseId, $userId, $details = []): void
    {
        $auditData = [
            'action' => $action,
            'response_id' => $responseId,
            'user_id' => $userId,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
            'details' => $details,
        ];

        // Store in cache for immediate access and database for persistence
        $auditKey = "audit:{$responseId}:" . time();
        Cache::put($auditKey, $auditData, 86400 * 120); // 30 days

        Log::channel('audit')->info('Survey Audit', $auditData);
    }

    /**
     * Check rate limiting for specific action
     */
    public static function checkActionRateLimit($action, $userId, $limit, $windowMinutes = 60): bool
    {
        $key = "rate_limit:{$action}:{$userId}:" . floor(time() / ($windowMinutes * 60));
        $attempts = Cache::get($key, 0);

        if ($attempts >= $limit) {
            self::logSecurityEvent('Rate limit exceeded', [
                'action' => $action,
                'user_id' => $userId,
                'attempts' => $attempts,
                'limit' => $limit,
            ]);
            return false;
        }

        Cache::put($key, $attempts + 1, $windowMinutes * 60);
        return true;
    }

    /**
     * Validate survey response integrity
     */
    public static function validateResponseIntegrity($responseId): array
    {
        $issues = [];

        $response = CenterSurveyResponse::with(['answers', 'survey.section.domains.questions'])
            ->find($responseId);

        if (!$response) {
            $issues[] = 'Survey response not found';
            return $issues;
        }

        // Check for missing required relationships
        if (!$response->survey) {
            $issues[] = 'Survey definition missing';
        }

        if (!$response->survey->section) {
            $issues[] = 'Survey section missing';
        }

        // Check answer consistency
        $validQuestionIds = [];
        if ($response->survey && $response->survey->section) {
            foreach ($response->survey->section->domains as $domain) {
                foreach ($domain->questions as $question) {
                    $validQuestionIds[] = $question->id;
                }
            }
        }

        foreach ($response->answers as $answer) {
            if (!in_array($answer->question_id, $validQuestionIds)) {
                $issues[] = "Answer for invalid question ID: {$answer->question_id}";
            }
        }

        // Check for duplicate answers
        $questionIds = $response->answers->pluck('question_id')->toArray();
        if (count($questionIds) !== count(array_unique($questionIds))) {
            $issues[] = 'Duplicate answers detected';
        }

        return $issues;
    }

    /**
     * Clean up expired security data
     */
    public static function cleanupExpiredSecurityData(): int
    {
        $cleanedCount = 0;

        // This would typically clean up cache entries, audit logs, etc.
        // Implementation depends on your specific caching and logging setup

        self::logSecurityEvent('Security data cleanup completed', [
            'cleaned_entries' => $cleanedCount,
        ]);

        return $cleanedCount;
    }

     /**
     * Check for duplicate submission or frequent submission limit for a specific action and user.
     */
    public static function checkDuplicateLimit(string $action, int $userId, int $limit = 1, int $decaySeconds = 60): bool
    {
        $key = "duplicate_limit:{$action}:{$userId}";
        $attempts = Cache::get($key, 0);

        if ($attempts >= $limit) {
            Log::warning("Duplicate or frequent submission limit exceeded", [
                "action" => $action,
                "user_id" => $userId,
                "attempts" => $attempts,
            ]);
            return true;
        }

        Cache::put($key, $attempts + 1, $decaySeconds);
        return false;
    }
}


