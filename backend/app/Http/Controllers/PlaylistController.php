<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Playlist;

class PlaylistController extends Controller
{
    /**
     * Display a listing of the user's playlists.
     */
    public function index(Request $request)
    {
        $playlists = Playlist::where('user_id', $request->user()->id)
            ->withCount('songs')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($playlists);
    }

    /**
     * Store a newly created playlist in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000'
        ]);

        $playlist = Playlist::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null
        ]);

        return response()->json($playlist, 201);
    }

    /**
     * Display the specified playlist.
     */
    public function show(Playlist $playlist)
    {
        // Verificar que la playlist pertenece al usuario autenticado
        if ($playlist->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json($playlist->load(['songs.artist']));
    }

    /**
     * Update the specified playlist in storage.
     */
    public function update(Request $request, Playlist $playlist)
    {
        // Verificar que la playlist pertenece al usuario autenticado
        if ($playlist->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000'
        ]);

        $playlist->update($validated);

        return response()->json($playlist);
    }

    /**
     * Remove the specified playlist from storage.
     */
    public function destroy(Playlist $playlist)
    {
        // Verificar que la playlist pertenece al usuario autenticado
        if ($playlist->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $playlist->delete();
        return response()->json(null, 204);
    }
    
    /**
     * Add a song to the playlist.
     */
    public function addSong(Request $request, Playlist $playlist)
    {
        // Verificar que la playlist pertenece al usuario autenticado
        if ($playlist->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'song_id' => 'required|integer|exists:songs,id'
        ]);
        
        // Verificar si la canción ya está en la playlist
        if ($playlist->songs()->where('song_id', $validated['song_id'])->exists()) {
            return response()->json(['message' => 'Song already in playlist'], 409);
        }
        
        $playlist->songs()->attach($validated['song_id']);
        
        return response()->json([
            'message' => 'Song added to playlist',
            'playlist' => $playlist->load(['songs.artist'])
        ]);
    }
    
    /**
     * Remove a song from the playlist.
     */
    public function removeSong(Request $request, Playlist $playlist)
    {
        // Verificar que la playlist pertenece al usuario autenticado
        if ($playlist->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $validated = $request->validate([
            'song_id' => 'required|integer|exists:songs,id'
        ]);
        
        $playlist->songs()->detach($validated['song_id']);
        
        return response()->json([
            'message' => 'Song removed from playlist'
        ]);
    }
}
