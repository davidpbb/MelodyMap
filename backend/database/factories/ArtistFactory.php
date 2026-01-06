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
            'bio' => $this->faker->paragraph,
            'image' => $this->faker->imageUrl(200,200,'people')
        ];
    }
}
