<?php

namespace App\Imports;

use App\Models\Center;
use App\Models\Tbc;
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

class TbcImport implements
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
            if (!isset($row['code']) || trim($row['code']) === '') {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required field 'code'.";
                return null;
            }

            $center = null;
            if (isset($row['center_id']) && trim($row['center_id']) !== '') {
                $center = Center::where('label', $row['center_id'])->first();

                if (!$center) {
                    $this->customErrors[] = "Center '{$row['center_id']}' not found for code {$row['code']} - continuing without center.";
                    $center = null;
                }
            }

            $existingTbc = Tbc::where('code', $row['code'])->first();

            if ($existingTbc) {
                $existingTbc->update([
                    'code' => $row['code'],
                    'center_id' => $center?->name, // nullable safe
                ]);
                $tbc = $existingTbc;
            } else {
                $tbc = Tbc::create([
                    'code' => $row['code'],
                    'name' => Str::slug($row['code']),
                    'center_id' => $center?->name, // nullable safe
                ]);
            }

            $this->importedCount++;
            return $tbc;
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
            'code' => 'required|string|max:255',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'code.required' => 'Code is required.',
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
