<?php

namespace App\Imports;

use App\Models\Domain;
use App\Models\Medication;
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

class MedicationImport implements
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
                !isset($row['drug_name']) || trim($row['drug_name']) === '' ||
                !isset($row['allocation']) || trim($row['allocation']) === '' ||
                !isset($row['standard_quantity']) || trim($row['standard_quantity']) === '' ||
                !isset($row['section_id']) || trim($row['section_id']) === '' ||
                !isset($row['domain_id']) || trim($row['domain_id']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (drug_name, allocation, standard_quantity or section_id).";
                return null;
            }

            // Check section
            $section = Section::where('en_label', $row['section_id'])->first();
            $domain = Domain::where('en_label', $row['domain_id'])->first();

            if (!$section) {
                $this->skippedCount++;
                $this->customErrors[] = "Section '{$row['section_id']}' not found for medication {$row['name']} - skipped.";
                return null;
            }

            if (!$domain) {
                $this->skippedCount++;
                $this->customErrors[] = "Domain '{$row['domain_id']}' not found for medication {$row['name']} - skipped.";
                return null;
            }

            // Create or update medication
            $medication = Medication::updateOrCreate(
                ['drug_name' => $row['drug_name']],
                [
                    'drug_name' => $row['drug_name'],
                    'allocation' => $row['allocation'],
                    'standard_quantity' => $row['standard_quantity'],
                    'section_id' => $section->name,
                    'domain_id' => $domain->name,
                ]
            );

            $this->importedCount++;
            return $medication;
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
            'drug_name' => 'required|string',
            'allocation' => 'required|string',
            'standard_quantity' => 'required|integer',
            'section_id' => 'required|string',
            'domain_id' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'drug_name.required' => 'Drug Name is required.',
            'allocation.required' => 'Allocation is required.',
            'standard_quantity.required' => 'Standard Quantity is required.',
            'section_id.required' => 'Section is required.',
            'domain_id.required' => 'Domain is required.',
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
