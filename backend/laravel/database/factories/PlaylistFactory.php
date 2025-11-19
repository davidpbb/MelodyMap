<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PlaylistFactory extends Factory {
    
    public function definition() {

        $temas = [
            'Urban Vibes España',
            'Reggaeton Hits PR',
            'Flow Latino',
            'Trap y Beats',
            'Ritmo Callejero',
            'Top Urbano 2025',
            'Canciones del Barrio',
            'Latino Party',
            'Urbano y Chill',
            'Fiesta Boricua',
            'Éxitos Callejeros',
            'Beats de Medianoche',
            'Reggaeton Forever',
            'Sonidos del Caribe',
            'Urban Legends',
            'Trap del Momento',
            'Ritmo de Calle',
            'Vibra Latina',
            'Urbano y Remix',
            'Street Beats'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($temas),
            'description' => $this->faker->sentence
        ];
    }
}
