<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\Rank;
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

class CategoryImport implements
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
                !isset($row['category']) || trim($row['category']) === '' ||
                !isset($row['en_sector']) || trim($row['en_sector']) === '' ||
                !isset($row['en_specialty']) || trim($row['en_specialty']) === '' ||
                !isset($row['en_rank']) || trim($row['en_rank']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (category, en_sector, en_specialty or en_rank).";
                return null;
            }

            // Check zone
            $sector = Sector::where('en_sector', $row['en_sector'])->first();
            if (!$sector) {
                $this->skippedCount++;
                $this->customErrors[] = "Sector '{$row['en_sector']}' not found for specialty {$row['en_specialty']} - skipped.";
                return null;
            }

            $specialty = Specialty::where('en_specialty', $row['en_specialty'])->first();
            if (!$specialty) {
                $this->skippedCount++;
                $this->customErrors[] = "Sector '{$row['en_specialty']}' not found for rank {$row['en_rank']} - skipped.";
                return null;
            }

            $rank = Rank::where('en_rank', $row['en_rank'])->first();
            if (!$rank) {
                $this->skippedCount++;
                $this->customErrors[] = "Rank '{$row['en_rank']}' not found for category {$row['category']} - skipped.";
                return null;
            }

            $existingCategory = Category::where('category', $row['category'])
                ->where('sector_id', $sector->id)
                ->where('specialty_id', $specialty->id)
                ->where('rank_id', $rank->id)->first();

            if ($existingCategory) {
                $existingCategory->update([
                    'category' => $row['category'],
                    'sector_id' => $sector->id,
                    'specialty_id' => $specialty->id,
                    'rank_id' => $rank->id,
                    'updated_by' => Auth::id(),
                ]);
                $category = $existingCategory;
            } else {
                $category = Category::create([
                    'category' => $row['category'],
                    'sector_id' => $sector->id,
                    'specialty_id' => $specialty->id,
                    'rank_id' => $rank->id,
                    'create_by' => Auth::id(),
                ]);
            }

            $this->importedCount++;
            return $category;
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
            'category' => 'required|string',
            'en_sector' => 'required|string',
            'en_specialty' => 'required|string',
            'en_rank' => 'required|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'category.required' => 'Category is required.',
            'en_sector.required' => 'Healthcare field is required.',
            'en_specialty.required' => 'Healthcare specialty is required.',
            'en_rank.required' => 'Healthcare rank is required.',
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
