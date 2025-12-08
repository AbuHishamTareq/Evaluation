<?php

namespace App\Imports;

use App\Models\TbcRole;
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

class TbcRoleImport implements
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
                !isset($row['en_role']) || trim($row['en_role']) === '' ||
                !isset($row['ar_role']) || trim($row['ar_role']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_role, ar_role).";
                return null;
            }

            $existingTbcRole = TbcRole::where('en_role', $row['en_role'])->first();

            if ($existingTbcRole) {
                $existingTbcRole->update([
                    'en_role' => $row['en_role'],
                    'ar_role' => $row['ar_role'],
                    'updated_by' => Auth::user()->id,
                ]);
                $tbcRole = $existingTbcRole;
            } else {
                $tbcRole = TbcRole::create([
                    'en_role' => $row['en_role'],
                    'ar_role' => $row['ar_role'],
                    'create_by' => Auth::user()->id,
                ]);
            }

            $this->importedCount++;
            return $tbcRole;
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
            'en_role' => 'required|string',
            'ar_role' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_role.required' => 'Team based code role (EN) is required.',
            'ar_role.required' => 'Team based code role (AR) is required.',
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
