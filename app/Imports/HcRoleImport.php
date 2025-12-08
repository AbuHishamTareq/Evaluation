<?php

namespace App\Imports;

use App\Models\HcRole;
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

class HcRoleImport implements
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
                !isset($row['en_hcrole']) || trim($row['en_hcrole']) === '' ||
                !isset($row['ar_hcrole']) || trim($row['ar_hcrole']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_hcRole, ar_hcRole).";
                return null;
            }

            $existingHcRole = HcRole::where('en_hcRole', $row['en_hcrole'])->first();

            if ($existingHcRole) {
                $existingHcRole->update([
                    'en_hcRole' => $row['en_hcrole'],
                    'ar_hcRole' => $row['ar_hcrole'],
                    'updated_by' => Auth::user()->id,
                ]);
                $hcRole = $existingHcRole;
            } else {
                $hcRole = HcRole::create([
                    'en_hcRole' => $row['en_hcrole'],
                    'ar_hcRole' => $row['ar_hcrole'],
                    'create_by' => Auth::user()->id,
                ]);
            }

            $this->importedCount++;
            return $hcRole;
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
            'en_hcrole' => 'required|string',
            'ar_hcrole' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_hcrole.required' => 'Healthcare Role (EN) is required.',
            'ar_hcrole.required' => 'Healthcare Role (AR) is required.',
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
