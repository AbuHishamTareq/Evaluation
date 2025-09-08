<?php

namespace App\Imports;

use App\Models\Role;
use App\Models\Section;
use App\Models\Survey;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Str;

class EvaluationImport implements
    ToModel,
    WithHeadingRow,
    WithValidation,
    SkipsOnError,
    SkipsOnFailure,
    WithBatchInserts,
    WithChunkReading
{
    use Importable, SkipsErrors, SkipsFailures;

    private $importedCount = 0;
    private $skippedCount = 0;
    private $customErrors = [];

    public function model(array $row)
    {
        try {
            if (
                !isset($row['title']) || trim($row['title']) === '' ||
                !isset($row['ar_label']) || trim($row['ar_label']) === '' ||
                !isset($row['section_id']) || trim($row['section_id']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (title, ar_label, section_id).";
                return null;
            }

            // ✅ Find Section by `en_label` and get its `name` (slug)
            $section = Section::where('en_label', $row['section_id'])->first();
            if (!$section) {
                $this->skippedCount++;
                $this->customErrors[] = "Section '{$row['section_id']}' not found by en_label - skipped.";
                return null;
            }

            // ✅ Skip if this section already has a survey
            if (Survey::where('section_id', $section->name)->exists()) {
                $this->skippedCount++;
                $this->customErrors[] = "Survey already exists for section '{$section->en_label}' - skipped.";
                return null;
            }

            // ✅ Create or update survey
            $surveySlug = Str::slug($row['title']);
            $evaluation = Survey::updateOrCreate(
                ['name' => $surveySlug],
                [
                    'title'       => $row['title'],
                    'ar_label'    => $row['ar_label'],
                    'section_id'  => $section->name, // Save section.slug
                ]
            );

            // ✅ Parse roles by English label → get `name` (slug)
            if (!empty($row['roles'])) {
                $roleLabels = array_map('trim', explode(',', $row['roles'])); // e.g., ['Admin', 'Editor']
                $roleSlugs = Role::whereIn('label', $roleLabels)->pluck('name')->toArray();
                $evaluation->roles()->sync($roleSlugs);
            }

            $this->importedCount++;
            return $evaluation;
        } catch (\Exception $e) {
            $this->skippedCount++;
            $this->customErrors[] = "Error processing row: {$e->getMessage()}";
            return null;
        }
    }



    public function prepareForValidation($data)
    {
        return array_change_key_case($data, CASE_LOWER);
    }

    public function rules(): array
    {
        return [
            'title'    => 'required|string|max:255',
            'ar_label'    => 'required|string|max:255',
            'section_id'  => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'title.required'   => 'English subject is required.',
            'ar_label.required'   => 'Arabic subject is required.',
            'section_id.required' => 'Section is required.',
        ];
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }

    public function getImportStats(): array
    {
        return [
            'imported'        => $this->importedCount,
            'skipped'         => $this->skippedCount,
            'errors'          => $this->customErrors,
            'total_processed' => $this->importedCount + $this->skippedCount,
        ];
    }
}
