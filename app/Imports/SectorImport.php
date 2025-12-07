<?php

namespace App\Imports;

use App\Models\Sector;
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

class SectorImport implements
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
                !isset($row['en_sector']) || trim($row['en_sector']) === '' ||
                !isset($row['ar_sector']) || trim($row['ar_sector']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_sector, ar_sector).";
                return null;
            }

            $existingSector = Sector::where('en_sector', $row['en_sector'])->first();

            if ($existingSector) {
                $existingSector->update([
                    'en_sector' => $row['en_sector'],
                    'ar_sector' => $row['ar_sector'],
                    'updated_by' => Auth::user()->id,
                ]);
                $sector = $existingSector;
            } else {
                $sector = Sector::create([
                    'en_sector' => $row['en_sector'],
                    'ar_sector' => $row['ar_sector'],
                    'create_by' => Auth::user()->id,
                ]);
            }

            $this->importedCount++;
            return $sector;
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
            'en_sector' => 'required|string',
            'ar_sector' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_sector.required' => 'Sector (EN) is required.',
            'ar_sector.required' => 'Sector (AR) is required.',
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
