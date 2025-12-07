<?php

namespace App\Imports;

use App\Models\Sector;
use App\Models\Specialty;
use Illuminate\Support\Facades\Auth;
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

class SpecialtyImport implements
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
                !isset($row['en_specialty']) || trim($row['en_specialty']) === '' ||
                !isset($row['ar_specialty']) || trim($row['ar_specialty']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_specialty, ar_specialty).";
                return null;
            }

            $existingSpecialty = Specialty::where('en_specialty', $row['en_specialty'])->first();

            if ($existingSpecialty) {
                $existingSpecialty->update([
                    'en_specialty' => $row['en_specialty'],
                    'ar_specialty' => $row['ar_specialty'],
                    'updated_by' => Auth::id(),
                ]);
                $specialty = $existingSpecialty;
            } else {
                $specialty = Specialty::create([
                    'en_specialty' => $row['en_specialty'],
                    'ar_specialty' => $row['ar_specialty'],
                    'create_by' => Auth::id(),
                ]);
            }

            $this->importedCount++;
            return $specialty;
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
            'en_specialty' => 'required|string',
            'ar_specialty' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_specialty.required' => 'Healthcare specialty in English is required.',
            'ar_specialty.required' => 'Healthcare specialty in English is required.',
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
