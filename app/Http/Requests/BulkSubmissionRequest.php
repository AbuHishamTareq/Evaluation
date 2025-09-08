<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class BulkSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'answers' => [
                'required',
                'array',
                'min:1',
                'max:500', // Higher limit for bulk submission
            ],
            'answers.*.question_id' => [
                'required',
                // For final submission, validate question IDs
                function ($attribute, $value, $fail) {
                    // Allow numeric question IDs (regular questions)
                    if (is_numeric($value)) {
                        return;
                    }
                    
                    // Allow string composite keys for tabular data (format: med_medicationId_field_fieldId)
                    if (is_string($value) && preg_match('/^med_\d+_field_\d+$/', $value)) {
                        return;
                    }
                    
                    // Allow simple tabular format (format: medicationId_fieldId) for backward compatibility
                    if (is_string($value) && preg_match('/^\d+_\d+$/', $value)) {
                        return;
                    }
                    
                    $fail('The question ID must be either a number, a tabular key (format: medicationId_fieldId), or a medication field key (format: med_medicationId_field_fieldId).');
                },
            ],
            'answers.*.answer' => [
                'required',
                function ($attribute, $value, $fail) {
                    // Handle different answer types for final submission
                    if (is_array($value)) {
                        if (empty($value)) {
                            $fail('Answer array cannot be empty.');
                        }
                        return;
                    }
                    
                    if (is_numeric($value)) {
                        return; // Numeric values are allowed
                    }
                    
                    if (is_string($value)) {
                        // String answers should not be empty after trimming
                        if (trim($value) === '') {
                            $fail('Answer cannot be empty.');
                        }
                        return;
                    }
                    
                    if (is_bool($value)) {
                        return; // Boolean values are allowed
                    }
                    
                    $fail('Answer must be a string, number, boolean, or array.');
                },
            ],
            'answers.*.score' => [
                'nullable',
                'numeric',
                'min:0',
                'max:1000',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'answers.required' => 'Survey answers are required for submission.',
            'answers.array' => 'Answers must be provided as an array.',
            'answers.min' => 'At least one answer is required for submission.',
            'answers.max' => 'Too many answers provided. Maximum 500 answers allowed.',
            'answers.*.question_id.required' => 'Question ID is required for each answer.',
            'answers.*.answer.required' => 'Answer text is required for submission.',
            'answers.*.score.numeric' => 'Score must be a numeric value.',
            'answers.*.score.min' => 'Score cannot be negative.',
            'answers.*.score.max' => 'Score is too high. Maximum 1000 allowed.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $answers = $this->input('answers', []);
            
            // Check for duplicate question IDs
            $questionIds = collect($answers)->pluck('question_id')->toArray();
            if (count($questionIds) !== count(array_unique($questionIds))) {
                $validator->errors()->add('answers', 'Duplicate question IDs are not allowed in submission.');
            }

            // Validate that the user owns the survey response
            $responseId = $this->route('id');
            if ($responseId) {
                $response = \App\Models\CenterSurveyResponse::find($responseId);
                if (!$response || $response->submitted_by !== Auth::id()) {
                    $validator->errors()->add('response', 'Unauthorized access to this survey response.');
                    return;
                }

                // Check if the response can be submitted
                if ($response && !$response->canBeModified()) {
                    $validator->errors()->add('response', 'This survey has already been submitted.');
                    return;
                }

                // Validate numeric question IDs belong to the survey
                $numericQuestionIds = collect($questionIds)->filter(function ($id) {
                    return is_numeric($id);
                })->map(function ($id) {
                    return (int) $id;
                })->toArray();

                if (!empty($numericQuestionIds)) {
                    $validQuestionIds = $this->getValidQuestionIds($response);
                    $invalidQuestions = collect($numericQuestionIds)
                        ->diff($validQuestionIds)
                        ->values();

                    if ($invalidQuestions->isNotEmpty()) {
                        $validator->errors()->add(
                            'answers',
                            'Some questions do not belong to this survey: ' . $invalidQuestions->implode(', ')
                        );
                    }
                }

                // Check minimum completion requirements
                $this->validateCompletionRequirements($validator, $response, $answers);

                // Validate tabular data
                $this->validateTabularData($validator, $answers, $response);
            }
        });
    }

    /**
     * Validate minimum completion requirements
     */
    private function validateCompletionRequirements($validator, $response, $answers)
    {
        $validQuestionIds = $this->getValidQuestionIds($response);
        $totalQuestions = count($validQuestionIds);
        
        // Count answered regular questions
        $answeredRegularQuestions = collect($answers)->filter(function ($answer) {
            return is_numeric($answer['question_id']);
        })->count();
        
        // Count tabular answers
        $answeredTabularQuestions = collect($answers)->filter(function ($answer) {
            return is_string($answer['question_id']) && (
                preg_match('/^med_\d+_field_\d+$/', $answer['question_id']) ||
                preg_match('/^\d+_\d+$/', $answer['question_id'])
            );
        })->count();
        
        $totalAnswered = $answeredRegularQuestions + $answeredTabularQuestions;
        
        // Ensure at least some answers are provided
        if ($totalAnswered === 0) {
            $validator->errors()->add(
                'answers',
                'At least one answer must be provided for submission.'
            );
        }
        
        // For regular questions, require at least 30% completion
        if ($totalQuestions > 0) {
            $completionPercent = ($answeredRegularQuestions / $totalQuestions) * 100;
            
            if ($completionPercent < 30) {
                $validator->errors()->add(
                    'answers',
                    'Survey must be at least 30% complete for submission. Current completion: ' . 
                    round($completionPercent, 1) . '%'
                );
            }
        }
    }

    /**
     * Validate tabular data
     */
    private function validateTabularData($validator, array $answers, $response)
    {
        $tabularAnswers = collect($answers)->filter(function ($answer) {
            return is_string($answer['question_id']) && (
                preg_match('/^med_\d+_field_\d+$/', $answer['question_id']) ||
                preg_match('/^\d+_\d+$/', $answer['question_id'])
            );
        });

        if ($tabularAnswers->isEmpty()) {
            return; // No tabular data to validate
        }

        // Extract medication IDs from tabular answers
        $medicationIds = $tabularAnswers->map(function ($answer) {
            $questionId = $answer['question_id'];
            
            // Handle both formats: "med_1_field_2" and "1_2"
            if (preg_match('/^med_(\d+)_field_\d+$/', $questionId, $matches)) {
                return (int) $matches[1];
            } elseif (preg_match('/^(\d+)_\d+$/', $questionId, $matches)) {
                return (int) $matches[1];
            }
            
            return null;
        })->filter()->unique();

        // Validate that medication IDs exist (if you have a medications table)
        foreach ($medicationIds as $medId) {
            $exists = \App\Models\Medication::where('id', $medId)->exists();
            if (!$exists) {
                $validator->errors()->add(
                    'answers',
                    "Invalid medication ID: {$medId}"
                );
            }
        }

        // Log tabular data for debugging
        \Log::info('Bulk submission with tabular data', [
            'response_id' => $response->id,
            'tabular_count' => $tabularAnswers->count(),
            'medication_ids' => $medicationIds->toArray(),
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Get valid question IDs for the survey response
     */
    private function getValidQuestionIds($response): array
    {
        if (!$response->survey || !$response->survey->section) {
            return [];
        }

        $questionIds = [];
        $domains = $response->survey->section->domains ?? collect();

        foreach ($domains as $domain) {
            foreach ($domain->questions as $question) {
                $questionIds[] = $question->id;
            }
        }

        return $questionIds;
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $response = response()->json([
            'error' => 'Submission validation failed',
            'message' => 'The survey data is invalid and cannot be submitted.',
            'errors' => $validator->errors(),
        ], 422);

        throw new \Illuminate\Validation\ValidationException($validator, $response);
    }

    /**
     * Get validated and sanitized data
     */
    public function getValidatedAnswers(): array
    {
        $answers = $this->validated()['answers'];
        
        // Sanitize and normalize answers
        return collect($answers)->map(function ($answer) {
            $sanitizedAnswer = $answer['answer'];
            
            // Handle different answer types
            if (is_array($sanitizedAnswer)) {
                $sanitizedAnswer = json_encode($sanitizedAnswer);
            } elseif (is_bool($sanitizedAnswer)) {
                $sanitizedAnswer = $sanitizedAnswer ? '1' : '0';
            } elseif (is_numeric($sanitizedAnswer)) {
                $sanitizedAnswer = (string) $sanitizedAnswer;
            } else {
                $sanitizedAnswer = trim(strip_tags((string) $sanitizedAnswer));
            }

            return [
                'question_id' => $answer['question_id'],
                'answer' => $sanitizedAnswer,
                'score' => isset($answer['score']) ? (float) $answer['score'] : 0,
            ];
        })->toArray();
    }
}