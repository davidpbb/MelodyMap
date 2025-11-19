<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Listen extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'song_id', 'listened_at'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function song() {
        return $this->belongsTo(Song::class);
    }
}
