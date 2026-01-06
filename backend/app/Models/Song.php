<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Song extends Model
{
    use HasFactory;
    
    protected $fillable = ['title', 'artist_id', 'duration', 'album'];

    public function artist() {
        return $this->belongsTo(Artist::class);
    }

    public function playlists() {
        return $this->belongsToMany(Playlist::class);
    }

    public function listens() {
        return $this->hasMany(Listen::class);
    }
}
