<?php

namespace App\Imports;

use App\Models\Rank;
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

class RankImport implements
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
                !isset($row['en_rank']) || trim($row['en_rank']) === '' ||
                !isset($row['ar_rank']) || trim($row['ar_rank']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (en_rank, ar_rank).";
                return null;
            }

            $existingRank = Rank::where('en_rank', $row['en_rank'])->first();

            if ($existingRank) {
                $existingRank->update([
                    'en_rank' => $row['en_rank'],
                    'ar_rank' => $row['ar_rank'],
                    'updated_by' => Auth::id(),
                ]);
                $rank = $existingRank;
            } else {
                $rank = Rank::create([
                    'en_rank' => $row['en_rank'],
                    'ar_rank' => $row['ar_rank'],
                    'create_by' => Auth::id(),
                ]);
            }

            $this->importedCount++;
            return $rank;
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
            'en_rank' => 'required|string',
            'ar_rank' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_rank.required' => 'Healthcare rank in English is required.',
            'ar_rank.required' => 'Healthcare rank in Arabic is required.',
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
