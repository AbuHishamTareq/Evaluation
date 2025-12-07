<?php

namespace App\Imports;

use App\Models\Department;
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

class DepartmentImport implements
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
                !isset($row['en_department']) || trim($row['en_department']) === '' ||
                !isset($row['ar_department']) || trim($row['ar_department']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_department, ar_department).";
                return null;
            }

            $existingDepartment = Department::where('en_department', $row['en_department'])->first();

            if ($existingDepartment) {
                $existingDepartment->update([
                    'en_department' => $row['en_department'],
                    'ar_department' => $row['ar_department'],
                    'updated_by' => Auth::user()->id,
                ]);
                $department = $existingDepartment;
            } else {
                $department = Department::create([
                    'en_department' => $row['en_department'],
                    'ar_department' => $row['ar_department'],
                    'create_by' => Auth::user()->id,
                ]);
            }

            $this->importedCount++;
            return $department;
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
            'en_department' => 'required|string',
            'ar_department' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_department.required' => 'Department (EN) is required.',
            'ar_department.required' => 'Department (AR) is required.',
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
