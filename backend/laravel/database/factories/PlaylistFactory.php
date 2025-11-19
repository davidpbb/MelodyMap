<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PlaylistFactory extends Factory {
    
    public function definition() {

        $temas = ['Top Urbano', 'Fiesta', 'Relax', 'Favoritas', 'Noche de Flow', 'Playlist del Dei'];

        return [
            'name' => $this->faker->unique()->randomElement($temas),
            'description' => $this->faker->sentence
        ];
    }
}
