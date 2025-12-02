<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Artist extends Model
{
    use HasFactory;
    
    protected $fillable = ['name', 'bio', 'image'];

    public function songs() {
        return $this->hasMany(Song::class);
    }
}
