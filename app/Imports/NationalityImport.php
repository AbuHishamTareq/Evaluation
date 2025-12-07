<?php

namespace App\Imports;

use App\Models\Nationality;
use Illuminate\Support\Collection;
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

class NationalityImport implements
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
                !isset($row['iso_code_3']) || trim($row['iso_code_3']) === '' ||
                !isset($row['en_nationality']) || trim($row['en_nationality']) === '' ||
                !isset($row['ar_nationality']) || trim($row['ar_nationality']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (iso_code_3, en_nationality, ar_nationality).";
                return null;
            }

            $existingNationality = Nationality::where('en_nationality', $row['en_nationality'])->first();

            if ($existingNationality) {
                $existingNationality->update([
                    'iso_code_3' => $row['iso_code_3'],
                    'en_nationality' => $row['en_nationality'],
                    'ar_nationality' => $row['ar_nationality'],
                    'updated_by' => Auth::user()->id,
                ]);
                $nationality = $existingNationality;
            } else {
                $nationality = Nationality::create([
                    'iso_code_3' => $row['iso_code_3'],
                    'en_nationality' => $row['en_nationality'],
                    'ar_nationality' => $row['ar_nationality'],
                    'create_by' => Auth::user()->id,
                ]);
            }

            $this->importedCount++;
            return $nationality;
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
            'en_nationality' => 'required|string',
            'ar_nationality' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_nationality.required' => 'Nationality (EN) is required.',
            'ar_nationality.required' => 'Nationality (AR) is required.',
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
