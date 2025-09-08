<?php

namespace Database\Seeders;

use App\Models\Center;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Center::updateOrCreate(
            ['name' => 'Northern Center'],
            [
                'name' => 'Northern Center',
                'phc_moh_code' => '001',
                'zone_id' => 1,
            ]
        );
    }
}
