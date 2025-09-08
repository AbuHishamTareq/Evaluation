<?php

namespace App\Imports;

use App\Models\Center;
use App\Models\Zone;
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

class CenterImport implements
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
                !isset($row['name']) || trim($row['name']) === '' ||
                !isset($row['phc_moh_code']) || trim($row['phc_moh_code']) === '' ||
                !isset($row['zone_id']) || trim($row['zone_id']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (name, phc_moh_code, or zone_id).";
                return null;
            }

            // Check zone
            $zone = Zone::where('label', $row['zone_id'])->first();
            if (!$zone) {
                $this->skippedCount++;
                $this->customErrors[] = "Zone '{$row['zone_id']}' not found for center {$row['name']} - skipped.";
                return null;
            }

            // Create or update center
            $center = Center::updateOrCreate(
                ['phc_moh_code' => $row['phc_moh_code']],
                [
                    'label' => $row['name'],
                    'name'    => Str::slug($row['name']), 
                    'zone_id' => $zone->name,
                    'status' => 'active',
                ]
            );

            $this->importedCount++;
            return $center;

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
            'name' => 'required|string|max:255',
            'phc_moh_code' => 'required|string|max:50',
            'zone_id' => 'required|string|max:255',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'label.required' => 'Name is required.',
            'phc_moh_code.required' => 'Phc Code is required.',
            'zone_id.required' => 'Zone is required.',
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
