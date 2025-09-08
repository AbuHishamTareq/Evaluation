<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Zone::updateOrCreate(
            ['name' => 'Northern Zone'],
            [
                'name' => 'Northern Zone',
                'elt_id' => 1,
            ]
        );
    }
}
