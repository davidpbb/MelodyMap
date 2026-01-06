<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Artist extends Model
{
    use HasFactory;
    
    protected $fillable = ['name', 'bio', 'image', 'pais', 'genero', 'genero_musical', 'fecha_de_nacimiento', 'discográfica', 'youtube', 'spotify', 'instagram', 'other_links'];

    public function songs() {
        return $this->hasMany(Song::class);
    }
}
