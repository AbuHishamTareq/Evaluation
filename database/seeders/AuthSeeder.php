<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AuthSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or get the super-admin role
        $role = Role::firstOrCreate(['name' => 'super-admin']);

        // Create or update the user
        $user = User::updateOrCreate(
            ['email' => 'tareq.abd@hotmail.com'],
            [
                'name' => 'Tareq Abdulrahman',
                'email' => 'tareq.abd@hotmail.com',
                'password' => Hash::make('T@ghreed81'), // Secure hash!
            ]
        );

        // Assign the role
        $user->assignRole($role);
    }
}
