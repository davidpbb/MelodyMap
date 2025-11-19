<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SongFactory extends Factory {
    
    public function definition() {

        $canciones_urbano = [
            'Tití me preguntó', 'Me porto bonito','Adicto', 'China', 'Se preparó',
            'Dile que tú me quieres', 'Todo de ti', 'BESO', 'Está Cabrón (Remix)',
            'La Llamada', 'Mala Mujer', 'Tú Me Dejaste De Querer', 'A mí', 'cómo dormiste?',
            'Dracukeo', 'Serpiente Veneno', 'La Florinata', 'Give Me the Kush', 'Alba',
            'Boo', 'A.D.R.O.M.I.C.F.M.S. 2', 'Ready pa Morir', 'She don\'t give a FO',
            'Goteo', 'Loca', 'Ayer me llamó mi ex', 'Nada', 'Toda', 'Tumbando el Club (Remix)',
            'Quavo #Mododiablo', 'Dance Crip', 'Mamichula', 'Mi Gente', 'In da Getto','Hawái',
            'Felices los 4', 'Tusa', 'BICHOTA', 'Hasta el amanecer', 'Travesuras', 'Robarte un beso',
            'Tacones rojos', 'Malamente', 'DESPECHÁ', 'DÁKITI', 'Sensual Bebé'
        ];

        return [
            'title' => $this->faker->unique()->randomElement($canciones_urbano),
            'duration' => $this->faker->numberBetween(120,300),
            'album' => $this->faker->word
        ];
    }
}