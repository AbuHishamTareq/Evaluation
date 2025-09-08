<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CenterSurveyResponseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'center' => 'required|string',
            'evaluation' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'center.required' => 'Please select a center.',
            'center.string'   => 'The center must be a valid string.',
            'evaluation.required' => 'Please Select Section or Section didn\'t have Evaluation Form',
            'evaluation.string'   => 'The evaluation must be a valid string.',
        ];
    }
}
