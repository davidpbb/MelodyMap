<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendshipController extends Controller
{
    /**
     * Buscar usuarios por nombre o email
     */
    public function searchUsers(Request $request)
    {
        $query = $request->input('query');
        
        if (!$query || strlen($query) < 2) {
            return response()->json(['users' => []]);
        }

        $currentUserId = auth()->id();

        // Buscar usuarios excluyendo al usuario actual
        $users = User::where('id', '!=', $currentUserId)
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('email', 'LIKE', "%{$query}%");
            })
            ->select('id', 'name', 'email', 'created_at')
            ->limit(10)
            ->get();

        // Para cada usuario, verificar el estado de amistad
        $users = $users->map(function($user) use ($currentUserId) {
            $friendship = Friendship::where(function($q) use ($currentUserId, $user) {
                $q->where('user_id', $currentUserId)->where('friend_id', $user->id);
            })->orWhere(function($q) use ($currentUserId, $user) {
                $q->where('user_id', $user->id)->where('friend_id', $currentUserId);
            })->first();

            $user->friendship_status = $friendship ? $friendship->status : null;
            $user->is_friend_request_sent = $friendship && $friendship->user_id == $currentUserId;
            
            return $user;
        });

        return response()->json(['users' => $users]);
    }

    /**
     * Enviar solicitud de amistad
     */
    public function sendRequest(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id'
        ]);

        $userId = auth()->id();
        $friendId = $request->friend_id;

        // No puedes enviarte solicitud a ti mismo
        if ($userId == $friendId) {
            return response()->json(['error' => 'No puedes agregarte a ti mismo'], 400);
        }

        // Verificar si ya existe una solicitud
        $existingFriendship = Friendship::where(function($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->first();

        if ($existingFriendship) {
            return response()->json(['error' => 'Ya existe una solicitud de amistad'], 400);
        }

        // Crear solicitud
        $friendship = Friendship::create([
            'user_id' => $userId,
            'friend_id' => $friendId,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Solicitud de amistad enviada',
            'friendship' => $friendship->load(['friend'])
        ]);
    }

    /**
     * Obtener solicitudes pendientes recibidas
     */
    public function getPendingRequests()
    {
        $userId = auth()->id();

        $requests = Friendship::where('friend_id', $userId)
            ->where('status', 'pending')
            ->with('user:id,name,email,created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['requests' => $requests]);
    }

    /**
     * Aceptar solicitud de amistad
     */
    public function acceptRequest($friendshipId)
    {
        $userId = auth()->id();

        $friendship = Friendship::where('id', $friendshipId)
            ->where('friend_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        $friendship->status = 'accepted';
        $friendship->save();

        return response()->json([
            'message' => 'Solicitud aceptada',
            'friendship' => $friendship->load(['user'])
        ]);
    }

    /**
     * Rechazar solicitud de amistad
     */
    public function rejectRequest($friendshipId)
    {
        $userId = auth()->id();

        $friendship = Friendship::where('id', $friendshipId)
            ->where('friend_id', $userId)
            ->where('status', 'pending')
            ->first();

        if (!$friendship) {
            return response()->json(['error' => 'Solicitud no encontrada'], 404);
        }

        $friendship->delete();

        return response()->json(['message' => 'Solicitud rechazada']);
    }

    /**
     * Obtener lista de amigos (aceptados)
     */
    public function getFriends()
    {
        $userId = auth()->id();

        // Amigos a los que yo envié request
        $friendsISent = Friendship::where('user_id', $userId)
            ->where('status', 'accepted')
            ->with('friend:id,name,email,created_at')
            ->get()
            ->map(function($friendship) {
                return $friendship->friend;
            });

        // Amigos que me enviaron request
        $friendsIReceived = Friendship::where('friend_id', $userId)
            ->where('status', 'accepted')
            ->with('user:id,name,email,created_at')
            ->get()
            ->map(function($friendship) {
                return $friendship->user;
            });

        // Combinar ambas listas
        $friends = $friendsISent->merge($friendsIReceived);

        return response()->json(['friends' => $friends]);
    }

    /**
     * Eliminar amistad
     */
    public function removeFriend($friendId)
    {
        $userId = auth()->id();

        $friendship = Friendship::where(function($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->first();

        if (!$friendship) {
            return response()->json(['error' => 'Amistad no encontrada'], 404);
        }

        $friendship->delete();

        return response()->json(['message' => 'Amistad eliminada']);
    }

    /**
     * Ver estadísticas de un amigo
     */
    public function getFriendStats($friendId)
    {
        $userId = auth()->id();

        // Verificar que son amigos
        $areFriends = Friendship::where(function($q) use ($userId, $friendId) {
            $q->where('user_id', $userId)->where('friend_id', $friendId);
        })->orWhere(function($q) use ($userId, $friendId) {
            $q->where('user_id', $friendId)->where('friend_id', $userId);
        })->where('status', 'accepted')->exists();

        if (!$areFriends) {
            return response()->json(['error' => 'No sois amigos'], 403);
        }

        // Obtener datos del amigo
        $friend = User::find($friendId);
        if (!$friend) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        // Obtener estadísticas del amigo (similar a ListenController::statistics)
        $totalListens = DB::table('listens')
            ->where('user_id', $friendId)
            ->count();

        $uniqueSongs = DB::table('listens')
            ->where('user_id', $friendId)
            ->distinct('song_id')
            ->count('song_id');

        $uniqueArtists = DB::table('listens')
            ->where('user_id', $friendId)
            ->join('songs', 'listens.song_id', '=', 'songs.id')
            ->distinct('songs.artist_id')
            ->count('songs.artist_id');

        $topSongs = DB::table('listens')
            ->where('user_id', $friendId)
            ->join('songs', 'listens.song_id', '=', 'songs.id')
            ->select('songs.id as song_id', 'songs.title as name', DB::raw('COUNT(*) as listen_count'))
            ->groupBy('songs.id', 'songs.title')
            ->orderBy('listen_count', 'desc')
            ->limit(10)
            ->get();

        $topArtists = DB::table('listens')
            ->where('user_id', $friendId)
            ->join('songs', 'listens.song_id', '=', 'songs.id')
            ->join('artists', 'songs.artist_id', '=', 'artists.id')
            ->select('artists.id', 'artists.name', DB::raw('COUNT(*) as listen_count'))
            ->groupBy('artists.id', 'artists.name')
            ->orderBy('listen_count', 'desc')
            ->limit(10)
            ->get();

        // Obtener playlists creadas por el amigo
        $playlists = DB::table('playlists')
            ->where('user_id', $friendId)
            ->leftJoin('playlist_song', 'playlists.id', '=', 'playlist_song.playlist_id')
            ->select(
                'playlists.id',
                'playlists.name',
                'playlists.description',
                'playlists.created_at',
                DB::raw('COUNT(playlist_song.song_id) as songs_count')
            )
            ->groupBy('playlists.id', 'playlists.name', 'playlists.description', 'playlists.created_at')
            ->orderBy('playlists.created_at', 'desc')
            ->get();

        return response()->json([
            'friend' => $friend,
            'stats' => [
                'total_listens' => $totalListens,
                'unique_songs' => $uniqueSongs,
                'unique_artists' => $uniqueArtists,
                'top_songs' => $topSongs,
                'top_artists' => $topArtists,
                'playlists' => $playlists
            ]
        ]);
    }
}