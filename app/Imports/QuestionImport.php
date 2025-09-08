<?php

namespace App\Imports;

use App\Models\Question;
use App\Models\Domain;
use Illuminate\Support\Str;
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

class QuestionImport implements
    ToModel,
    WithHeadingRow,
    WithValidation,
    SkipsOnError,
    SkipsOnFailure,
    WithBatchInserts,
    WithChunkReading
{
    use Importable, SkipsErrors, SkipsFailures;

    private int $importedCount = 0;
    private int $skippedCount = 0;
    private array $customErrors = [];

    public function model(array $row)
    {
        try {
            if (
                empty($row['en_label']) ||
                empty($row['ar_label']) ||
                empty($row['type'])
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing en_label, ar_label, or type.";
                return null;
            }

            // Parse options
            $options = [];
            if (!empty($row['options'])) {
                try {
                    $decoded = json_decode($row['options'], true, 512, JSON_THROW_ON_ERROR);
                    if (is_array($decoded)) {
                        $options = $decoded;
                    } else {
                        throw new \Exception("Options must be a valid JSON array.");
                    }
                } catch (\Throwable $e) {
                    $this->skippedCount++;
                    $this->customErrors[] = "Invalid JSON in options for question: {$row['en_label']}";
                    return null;
                }
            }

            // Get domain ID from name
            $domainId = null;
            if (!empty($row['domain_id'])) {
                $domain = Domain::where('en_label', $row['domain_id'])->first();
                if ($domain) {
                    $domainId = $domain->name;
                } else {
                    $this->skippedCount++;
                    $this->customErrors[] = "Invalid domain '{$row['domain_id']}' for question: {$row['en_label']}";
                    return null;
                }
            }

            $existing = Question::where('name', Str::slug($row['en_label']))->first();

            if ($existing) {
                $existing->update([
                    'en_label'  => $row['en_label'],
                    'en_extra_label' => $row['en_extra_label'] ?? '',
                    'ar_label'  => $row['ar_label'],
                    'ar_extra_label' => $row['ar_extra_label'] ?? '',
                    'type'      => $row['type'],
                    'data'      => json_encode(['options' => $options], JSON_UNESCAPED_UNICODE),
                    'domain_id' => $domainId,
                ]);
                $this->importedCount++;
                return $existing;
            }

            $question = Question::create([
                'en_label'  => $row['en_label'],
                'en_extra_label' => $row['en_extra_label'] ?? '',
                'ar_label'  => $row['ar_label'],
                'ar_extra_label' => $row['ar_extra_label'] ?? '',
                'name'      => Str::slug($row['en_label']),
                'type'      => $row['type'],
                'data'      => json_encode(['options' => $options], JSON_UNESCAPED_UNICODE),
                'domain_id' => $domainId,
            ]);

            $this->importedCount++;
            return $question;
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
            'en_label'  => 'required|string|max:1024',
            'en_extra_label' => 'nullable|string|max:1024',
            'ar_label'  => 'required|string|max:1024',
            'ar_extra_label' => 'nullable|string|max:1024',
            'type'      => 'required|string|in:radio,checkbox,text,select,rating',
            'options'   => 'nullable|string',
            'domain_id' => 'nullable|string', // Will be validated manually in model()
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'en_label.required' => 'English label is required.',
            'ar_label.required' => 'Arabic label is required.',
            'type.required'     => 'Type is required.',
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
            'imported'        => $this->importedCount,
            'skipped'         => $this->skippedCount,
            'errors'          => $this->customErrors,
            'total_processed' => $this->importedCount + $this->skippedCount,
        ];
    }
}
