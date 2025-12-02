<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Song;

class SongController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Song::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'artist_id' => 'required|integer|exists:artists,id',
            'duration' => 'required|integer',
            'album' => 'nullable|string'
        ]);

        $song = Song::create([
            'title' => $validated['title'],
            'artist_id' => $validated['artist_id'],
            'duration' => $validated['duration'],
            'album' => $validated['album'] ?? null
        ]);

        return response()->json($song, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Song $song)
    {
        return response()->json($song);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Song $song)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string',
            'artist_id' => 'sometimes|required|integer|exists:artists,id',
            'duration' => 'sometimes|required|integer',
            'album' => 'sometimes|nullable|string'
        ]);

        $song->update($validated);

        return response()->json($song);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Song $song)
    {
        $song->delete();
        return response()->json(null, 204);
    }
}
