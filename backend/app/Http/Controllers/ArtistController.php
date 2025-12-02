<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Artist;

class ArtistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Artist::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:artists,name',
            'bio' => 'nullable|string',
            'image' => 'nullable|url'
        ]);

        $artist = Artist::create([
            'name' => $validated['name'],
            'bio' => $validated['bio'] ?? null,
            'image' => $validated['image'] ?? null
        ]);

        return response()->json($artist, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Artist $artist)
    {
        return response()->json($artist);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Artist $artist)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'bio' => 'sometimes|nullable|string',
            'image' => 'sometimes|nullable|url'
        ]);

        $artist->update($validated);

        return response()->json($artist);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Artist $artist)
    {
        $artist->delete();
        return response()->json(null, 204);
    }
}
