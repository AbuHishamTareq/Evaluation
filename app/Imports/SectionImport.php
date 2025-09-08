<?php

namespace App\Imports;

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

class SectionImport implements
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
                !isset($row['type']) || trim($row['type']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_label, ar_label, type).";
                return null;
            }

            $existingDomain = Section::where('name', Str::slug($row['en_label']))->first();

            if ($existingDomain) {
                $existingDomain->update([
                    'en_label' => $row['en_label'],
                    'ar_label' => $row['ar_label'],
                    'evaluation_type' => $row['type'],
                ]);
                $domain = $existingDomain;
            } else {
                $domain = Section::create([
                    'en_label' => $row['en_label'],
                    'ar_label' => $row['ar_label'],
                    'name' => Str::slug($row['en_label']),
                    'evaluation_type' => $row['type'],
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
            'en_label' => 'required|string|max:255',
            'ar_label' => 'required|string|max:255',
            'type' => 'required',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_label.required' => 'English label is required.',
            'ar_label.required' => 'Arabic label is required.',
            'type.required' => 'Evaluation type is required.',
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
            'imported' => $this->importedCount,
            'skipped' => $this->skippedCount,
            'errors' => $this->customErrors,
            'total_processed' => $this->importedCount + $this->skippedCount,
        ];
    }
}
