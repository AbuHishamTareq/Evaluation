<?php

namespace App\Imports;

use App\Models\User;
use App\Models\Center;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class UserImport implements
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
                !isset($row['email']) || trim($row['email']) === '' ||
                !isset($row['password']) || trim($row['password']) === ''
            ) {
                $this->skippedCount++;
                $this->customErrors[] = "Row skipped: missing required fields (name, email, or password).";
                return null;
            }

            // Check center
            $centerId = null;
            if (!empty($row['center_id'])) {
                $center = Center::where('label', $row['center_id'])->first();
                if (!$center) {
                    $this->skippedCount++;
                    $this->customErrors[] = "Center '{$row['center_id']}' not found for user {$row['email']} - skipped.";
                    return null;
                }
                $centerId = $center->id;
            }

            // Create or update
            $user = User::updateOrCreate(
                ['email' => $row['email']],
                [
                    'name' => $row['name'],
                    'password' => Hash::make($row['password']),
                    'center_id' => $centerId,
                    'mobile' => $row['mobile'] ?? null,
                    'status' => 'active',
                ]
            );

            // Assign roles
            if (!empty($row['roles'])) {
                $roleNames = array_map('trim', explode(',', $row['roles']));
                $validRoles = [];

                foreach ($roleNames as $roleLabel) {
                    $role = Role::where('label', $roleLabel)->first();
                    if ($role) {
                        $validRoles[] = $role->name;
                    } else {
                        $this->customErrors[] = "Role '{$roleLabel}' not found for user {$row['email']} - role skipped.";
                    }
                }

                if (!empty($validRoles)) {
                    $user->syncRoles($validRoles);
                }
            }

            $this->importedCount++;
            return $user;
        } catch (\Exception $e) {
            $this->skippedCount++;
            $this->customErrors[] = "Error importing user {$row['email']}: " . $e->getMessage();
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
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6',
            'center_id' => 'nullable|string',
            'mobile' => 'nullable|string|max:20',
            'roles' => 'nullable|string',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'email.required' => 'Email is required.',
            'email.email' => 'Email must be valid.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 6 characters.',
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
