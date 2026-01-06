<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Artist;
use App\Models\Song;
use App\Models\Playlist;
use App\Models\Listen;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create my own admin user xd
        User::create([
            'name' => 'David Boss Xd',
            'email' => 'david@melodymap.com',
            'password' => Hash::make('davidboss123')
        ]);

        $users = User::factory()->count(10)->create();

        $artists = Artist::factory()->count(10)->create();

        foreach ($artists as $artist) {
            Song::factory()->count(2)->create([
                'artist_id' => $artist->id
            ]);
        }

        $songs = Song::all();

        foreach ($users as $user) {
            $playlist = Playlist::factory()->create([
                'user_id' => $user->id
            ]);

            $playlist->songs()->attach($songs->random(5)->pluck('id')->toArray());
        }

        foreach ($users as $user) {
            $songs->random(10)->each(function($song) use ($user) {
                Listen::create([
                    'user_id' => $user->id,
                    'song_id' => $song->id,
                    'listened_at' => Carbon::now()->subDays(rand(0,30))
                ]);
            });
        }
    }
}
