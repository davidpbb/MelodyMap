<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Artist>
 */
class ArtistFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $artistas = [
            'Bad Bunny', 'Anuel AA', 'Ozuna', 'Rauw Alejandro', 'Pusho',
            'C. Tangana', 'Rels B', 'Kidd Keo', 'Bejo', 'Yung Sarria', 'Yung Beef',
            'Duki', 'Khea', 'Cazzu', 'Neo Pistea', 'Trueno',
            'J Balvin', 'Maluma', 'Karol G', 'Nicky Jam', 'Sebastián Yatra',
            'Rosalía', 'Jhayco'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($artistas),
            'bio' => $this->faker->paragraph(),
            'image' => $this->faker->imageUrl(640, 480, 'artist', true),
            'pais' => $this->faker->country(),
            'genero' => $this->faker->randomElement(['Masculino', 'Femenino']),
            'genero_musical' => $this->faker->randomElement(['Reggaeton', 'Trap', 'Pop', 'Hip Hop', 'R&B']),
            'fecha_de_nacimiento' => $this->faker->date('Y-m-d', '2005-01-01'),
            'discográfica' => $this->faker->company() . ' Records',
            'youtube' => 'https://youtube.com/@' . $this->faker->userName(),
            'spotify' => 'https://open.spotify.com/artist/' . $this->faker->uuid(),
            'instagram' => 'https://instagram.com/' . $this->faker->userName(),
            'other_links' => $this->faker->url(),
        ];
    }
}