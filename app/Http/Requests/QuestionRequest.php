<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
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
            'label' => 'required|string|max:255',
            'ar_label' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,radio,checkbox,select,number,rating',
            'options' => 'nullable|array',
            // 'options.*.ar_label' => 'required_with:options|string',
            // 'options.*.en_label' => 'required_with:options|string',
        ];
    }
}
