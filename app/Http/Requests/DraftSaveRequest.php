<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class DraftSaveRequest extends FormRequest
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
                'max:200', // Reasonable limit for draft saves
            ],
            'answers.*.question_id' => [
                'required',
                // For draft saves, be more lenient with question IDs
                // Allow multiple formats for different types of questions
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
                    // Handle different answer types for draft saves
                    if (is_array($value)) {
                        return; // Arrays are allowed
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
            'answers.required' => 'At least one answer is required.',
            'answers.array' => 'Answers must be provided as an array.',
            'answers.min' => 'At least one answer is required.',
            'answers.max' => 'Too many answers provided. Maximum 200 answers allowed.',
            'answers.*.question_id.required' => 'Question ID is required for each answer.',
            'answers.*.answer.required' => 'Answer is required.',
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
                $validator->errors()->add('answers', 'Duplicate question IDs are not allowed.');
            }

            // Validate that the user owns the survey response
            $responseId = $this->route('id');
            if ($responseId) {
                $response = \App\Models\CenterSurveyResponse::find($responseId);
                if (!$response || $response->submitted_by !== Auth::id()) {
                    $validator->errors()->add('response', 'Unauthorized access to this survey response.');
                    return;
                }

                // Check if the response can be modified
                if ($response && !$response->canBeModified()) {
                    $validator->errors()->add('response', 'This survey response cannot be modified.');
                    return;
                }

                // For draft saves, we'll be more lenient with question validation
                // Only validate numeric question IDs against the database
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

                // For tabular data, we'll validate the format but not the existence
                $tabularQuestionIds = collect($questionIds)->filter(function ($id) {
                    return is_string($id) && (
                        preg_match('/^med_\d+_field_\d+$/', $id) || 
                        preg_match('/^\d+_\d+$/', $id)
                    );
                })->toArray();

                // Log tabular data for debugging if needed
                if (!empty($tabularQuestionIds)) {
                    \Log::info('Draft save with tabular data', [
                        'response_id' => $responseId,
                        'tabular_questions' => $tabularQuestionIds,
                        'user_id' => Auth::id(),
                    ]);
                }
            }
        });
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
            'error' => 'Validation failed',
            'message' => 'The provided data is invalid.',
            'errors' => $validator->errors(),
        ], 422);

        throw new \Illuminate\Validation\ValidationException($validator, $response);
    }

    /**
     * Get validated and sanitized answers
     */
    public function getValidatedAnswers(): array
    {
        $answers = $this->validated()['answers'];
        
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