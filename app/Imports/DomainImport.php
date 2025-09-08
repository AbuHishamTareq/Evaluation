<?php

namespace App\Imports;

use App\Models\Domain;
use App\Models\Section;
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

class DomainImport implements
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
            // Skip empty or invalid rows manually
            if (
                !isset($row['en_label']) || trim($row['en_label']) === '' ||
                !isset($row['ar_label']) || trim($row['ar_label']) === '' ||
                !isset($row['section_id']) || trim($row['section_id']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_label, ar_label, section_id).";
                return null;
            }

            // Find section by name not by label!
            $section = Section::where('en_label', $row['section_id'])->first();
            if (!$section) {
                $this->skippedCount++;
                $this->customErrors[] = "Section '{$row['section_id']}' not found for domain {$row['en_label']} - skipped.";
                return null;
            }

            $existingDomain = Domain::where('name', Str::slug($row['en_label']))->first();

            if ($existingDomain) {
                $existingDomain->update([
                    'en_label'    => $row['en_label'],
                    'ar_label'    => $row['ar_label'],
                    'section_id'  => $section->name, // Use name string
                ]);
                $domain = $existingDomain;
            } else {
                $domain = Domain::create([
                    'en_label'    => $row['en_label'],
                    'ar_label'    => $row['ar_label'],
                    'name'        => Str::slug($row['en_label']),
                    'section_id'  => $section->name, // Use name string
                ]);
            }

            $this->importedCount++;
            return $domain;

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
            'en_label'    => 'required|string|max:255',
            'ar_label'    => 'required|string|max:255',
            'section_id'  => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_label.required'   => 'English label is required.',
            'ar_label.required'   => 'Arabic label is required.',
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