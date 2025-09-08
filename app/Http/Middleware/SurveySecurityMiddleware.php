<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\CenterSurveyResponse;
use Illuminate\Support\Facades\Auth;

class SurveySecurityMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'error' => 'Authentication required',
                'message' => 'You must be logged in to access survey features.',
            ], 401);
        }

        // Get response ID from route
        $responseId = $request->route('id');
        if (!$responseId) {
            return response()->json([
                'error' => 'Invalid request',
                'message' => 'Survey response ID is required.',
            ], 400);
        }

        // Verify survey response exists and user has access
        $response = CenterSurveyResponse::find($responseId);
        if (!$response) {
            return response()->json([
                'error' => 'Survey not found',
                'message' => 'The requested survey response does not exist.',
            ], 404);
        }

        // Check ownership
        if ($response->submitted_by !== Auth::id()) {
            Log::warning('Unauthorized survey access attempt', [
                'user_id' => Auth::id(),
                'response_id' => $responseId,
                'owner_id' => $response->submitted_by,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'error' => 'Access denied',
                'message' => 'You do not have permission to access this survey.',
            ], 403);
        }

        // Check if survey is within the allowed time window (same month and year)
        $now = now();
        if ($response->year !== $now->year || $response->month !== $now->month) {
            return response()->json([
                'error' => 'Survey expired',
                'message' => 'This survey is no longer available for modification.',
            ], 410);
        }

        // Enhanced rate limiting with different limits for different endpoints
        $endpoint = $request->getPathInfo();
        $rateLimitConfig = $this->getRateLimitConfig($endpoint);
        
        $rateLimitKey = "survey_access:{$responseId}:" . Auth::id() . ":" . $rateLimitConfig['type'];
        $attempts = Cache::get($rateLimitKey, 0);
        
        if ($attempts > $rateLimitConfig['limit']) {
            Log::warning('Survey rate limit exceeded', [
                'user_id' => Auth::id(),
                'response_id' => $responseId,
                'attempts' => $attempts,
                'limit' => $rateLimitConfig['limit'],
                'endpoint' => $endpoint,
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'error' => 'Rate limit exceeded',
                'message' => $rateLimitConfig['message'],
                'retry_after' => $rateLimitConfig['window'],
            ], 429);
        }

        Cache::put($rateLimitKey, $attempts + 1, $rateLimitConfig['window']);

        // Check for suspicious activity patterns (more lenient)
        $this->checkSuspiciousActivity($request, $responseId);

        // Add response to request for use in controller
        $request->merge(['survey_response' => $response]);

        return $next($request);
    }

    /**
     * Get rate limit configuration based on endpoint
     */
    private function getRateLimitConfig($endpoint)
    {
        // More lenient rate limits for different operations
        if (strpos($endpoint, '/draft') !== false) {
            // Draft operations - very lenient for auto-save
            return [
                'type' => 'draft',
                'limit' => 300, // 300 requests per hour (5 per minute)
                'window' => 3600, // 1 hour
                'message' => 'Too many draft save requests. Auto-save will resume shortly.',
            ];
        }
        
        if (strpos($endpoint, '/submit') !== false) {
            // Final submission - more restrictive
            return [
                'type' => 'submit',
                'limit' => 10, // 10 submissions per hour
                'window' => 3600, // 1 hour
                'message' => 'Too many submission attempts. Please wait before trying again.',
            ];
        }
        
        if (strpos($endpoint, '/progress') !== false) {
            // Progress checks - very lenient
            return [
                'type' => 'progress',
                'limit' => 500, // 500 requests per hour
                'window' => 3600, // 1 hour
                'message' => 'Too many progress requests. Please wait before trying again.',
            ];
        }
        
        // Default for other operations
        return [
            'type' => 'general',
            'limit' => 200, // 200 requests per hour
            'window' => 3600, // 1 hour
            'message' => 'Too many requests. Please wait before trying again.',
        ];
    }

    /**
     * Check for suspicious activity patterns (more lenient)
     */
    private function checkSuspiciousActivity(Request $request, $responseId)
    {
        $userId = Auth::id();
        $ip = $request->ip();
        
        // Check for rapid successive requests (more lenient)
        $rapidRequestKey = "rapid_requests:{$userId}:{$responseId}";
        $rapidRequests = Cache::get($rapidRequestKey, []);
        $now = time();
        
        // Remove requests older than 2 minutes (increased from 1 minute)
        $rapidRequests = array_filter($rapidRequests, function($timestamp) use ($now) {
            return ($now - $timestamp) < 120; // 2 minutes
        });
        
        $rapidRequests[] = $now;
        Cache::put($rapidRequestKey, $rapidRequests, 300); // 5 minutes
        
        // If more than 50 requests in 2 minutes, log as suspicious (increased from 20 in 1 minute)
        if (count($rapidRequests) > 50) {
            Log::warning('Suspicious rapid survey requests detected', [
                'user_id' => $userId,
                'response_id' => $responseId,
                'ip' => $ip,
                'requests_per_2_minutes' => count($rapidRequests),
                'user_agent' => $request->userAgent(),
            ]);
        }

        // Check for requests from multiple IPs for same user/survey (more lenient)
        $ipTrackingKey = "survey_ips:{$userId}:{$responseId}";
        $knownIps = Cache::get($ipTrackingKey, []);
        
        if (!in_array($ip, $knownIps)) {
            $knownIps[] = $ip;
            Cache::put($ipTrackingKey, $knownIps, 86400); // 24 hours
            
            // If more than 5 different IPs, log as suspicious (increased from 3)
            if (count($knownIps) > 5) {
                Log::warning('Survey accessed from multiple IPs', [
                    'user_id' => $userId,
                    'response_id' => $responseId,
                    'ips' => $knownIps,
                    'current_ip' => $ip,
                ]);
            }
        }

        // Check for unusual user agent patterns (more lenient)
        $userAgent = $request->userAgent();
        if (empty($userAgent) || strlen($userAgent) < 5) { // Reduced from 10
            Log::info('Short user agent in survey request', [ // Changed from warning to info
                'user_id' => $userId,
                'response_id' => $responseId,
                'ip' => $ip,
                'user_agent' => $userAgent,
            ]);
        }
        
        // Only log bot detection, don't consider it suspicious for legitimate automation
        if (strpos(strtolower($userAgent), 'bot') !== false) {
            Log::info('Bot user agent detected in survey request', [
                'user_id' => $userId,
                'response_id' => $responseId,
                'ip' => $ip,
                'user_agent' => $userAgent,
            ]);
        }
    }

    /**
     * Handle exceptions that occur during middleware execution
     */
    public function handleException($request, $exception)
    {
        Log::error('Survey security middleware exception', [
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);

        return response()->json([
            'error' => 'Security check failed',
            'message' => 'Unable to verify survey access permissions.',
        ], 500);
    }
}