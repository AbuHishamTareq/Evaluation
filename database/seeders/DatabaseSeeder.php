<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            //AuthSeeder::class,
            //ZoneSeeder::class,
            //CenterSeeder::class,
        ]);

        //User::factory(20)->create();
    }
}
