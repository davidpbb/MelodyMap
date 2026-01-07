<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Friendship;

class RecommendationController extends Controller
{
    /**
     * Obtener recomendaciones personalizadas para el usuario
     */
    public function getRecommendations(Request $request)
    {
        $userId = auth()->id();

        // Obtener IDs de todos los amigos
        $friendIds = $this->getFriendIds($userId);

        if (empty($friendIds)) {
            return response()->json([
                'recommended_songs' => [],
                'recommended_artists' => [],
                'recommended_playlists' => []
            ]);
        }

        // 1. Canciones que amigos escucharon y el usuario NO
        $recommendedSongs = DB::table('listens')
            ->whereIn('listens.user_id', $friendIds)
            ->whereNotIn('listens.song_id', function($query) use ($userId) {
                $query->select('song_id')
                    ->from('listens')
                    ->where('user_id', $userId);
            })
            ->join('songs', 'listens.song_id', '=', 'songs.id')
            ->join('artists', 'songs.artist_id', '=', 'artists.id')
            ->join('users', 'listens.user_id', '=', 'users.id')
            ->select(
                'songs.id as song_id',
                'songs.title',
                'songs.album',
                'songs.duration',
                'artists.id as artist_id',
                'artists.name as artist_name',
                DB::raw('COUNT(DISTINCT listens.user_id) as friend_count'),
                DB::raw('COUNT(*) as total_listens'),
                DB::raw('GROUP_CONCAT(DISTINCT users.name SEPARATOR ", ") as friends_listening')
            )
            ->groupBy('songs.id', 'songs.title', 'songs.album', 'songs.duration', 'artists.id', 'artists.name')
            ->orderBy('friend_count', 'desc')
            ->orderBy('total_listens', 'desc')
            ->limit(10)
            ->get();

        // 2. Artistas populares entre amigos que el usuario NO ha escuchado
        $recommendedArtists = DB::table('listens')
            ->whereIn('listens.user_id', $friendIds)
            ->join('songs', 'listens.song_id', '=', 'songs.id')
            ->join('artists', 'songs.artist_id', '=', 'artists.id')
            ->whereNotIn('artists.id', function($query) use ($userId) {
                $query->select('songs.artist_id')
                    ->from('listens')
                    ->join('songs', 'listens.song_id', '=', 'songs.id')
                    ->where('listens.user_id', $userId);
            })
            ->select(
                'artists.id',
                'artists.name',
                'artists.image',
                'artists.genero_musical',
                DB::raw('COUNT(DISTINCT listens.user_id) as friend_count'),
                DB::raw('COUNT(*) as total_listens')
            )
            ->groupBy('artists.id', 'artists.name', 'artists.image', 'artists.genero_musical')
            ->orderBy('friend_count', 'desc')
            ->orderBy('total_listens', 'desc')
            ->limit(8)
            ->get();

        // 3. Playlists creadas por amigos
        $recommendedPlaylists = DB::table('playlists')
            ->whereIn('playlists.user_id', $friendIds)
            ->join('users', 'playlists.user_id', '=', 'users.id')
            ->leftJoin('playlist_song', 'playlists.id', '=', 'playlist_song.playlist_id')
            ->select(
                'playlists.id',
                'playlists.name',
                'playlists.description',
                'playlists.created_at',
                'users.name as creator_name',
                'users.id as creator_id',
                DB::raw('COUNT(playlist_song.song_id) as songs_count')
            )
            ->groupBy('playlists.id', 'playlists.name', 'playlists.description', 'playlists.created_at', 'users.name', 'users.id')
            ->having('songs_count', '>', 0)
            ->orderBy('playlists.created_at', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'recommended_songs' => $recommendedSongs,
            'recommended_artists' => $recommendedArtists,
            'recommended_playlists' => $recommendedPlaylists
        ]);
    }

    /**
     * Obtener IDs de todos los amigos del usuario
     */
    private function getFriendIds($userId)
    {
        $friendsISent = Friendship::where('user_id', $userId)
            ->where('status', 'accepted')
            ->pluck('friend_id');

        $friendsIReceived = Friendship::where('friend_id', $userId)
            ->where('status', 'accepted')
            ->pluck('user_id');

        return $friendsISent->merge($friendsIReceived)->unique()->toArray();
    }
}