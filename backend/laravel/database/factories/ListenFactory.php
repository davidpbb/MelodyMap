<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class ListenFactory extends Factory
{
    public function definition()
    {
        return [
            'listened_at' => Carbon::now()->subDays($this->faker->numberBetween(0,30))
        ];
    }
}