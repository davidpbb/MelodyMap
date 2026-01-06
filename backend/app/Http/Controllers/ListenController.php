<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Listen;
use App\Models\Song;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ListenController extends Controller
{
    /**
     * Display a listing of the user's listens.
     */
    public function index(Request $request)
    {
        $listens = Listen::where('user_id', $request->user()->id)
            ->with(['song.artist'])
            ->orderBy('listened_at', 'desc')
            ->paginate(50);
            
        return response()->json($listens);
    }

    /**
     * Store a newly created listen in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'song_id' => 'required|integer|exists:songs,id',
            'listened_at' => 'nullable|date'
        ]);

        $listen = Listen::create([
            'user_id' => $request->user()->id,
            'song_id' => $validated['song_id'],
            'listened_at' => $validated['listened_at'] ?? now()
        ]);

        return response()->json($listen->load(['song.artist']), 201);
    }

    /**
     * Get user's listening statistics.
     */
    public function statistics(Request $request)
    {
        $userId = $request->user()->id;
        
        // Validar filtros opcionales de fecha
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);
        
        $query = Listen::where('user_id', $userId);
        
        // Aplicar filtros de fecha si existen
        if ($request->has('start_date')) {
            $query->where('listened_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('listened_at', '<=', $request->end_date);
        }
        
        // Total de escuchas
        $totalListens = $query->count();
        
        // Top 10 canciones más escuchadas
        $topSongs = (clone $query)
            ->select('song_id', DB::raw('COUNT(*) as listen_count'))
            ->with('song.artist')
            ->groupBy('song_id')
            ->orderBy('listen_count', 'desc')
            ->limit(10)
            ->get();
        
        // Top 10 artistas más escuchados
        $topArtists = (clone $query)
            ->join('songs', 'listens.song_id', '=', 'songs.id')
            ->join('artists', 'songs.artist_id', '=', 'artists.id')
            ->select('artists.id', 'artists.name', DB::raw('COUNT(*) as listen_count'))
            ->groupBy('artists.id', 'artists.name')
            ->orderBy('listen_count', 'desc')
            ->limit(10)
            ->get();
        
        // Escuchas por mes (últimos 12 meses)
        $listensPerMonth = (clone $query)
            ->select(
                DB::raw('DATE_FORMAT(listened_at, "%Y-%m") as month'),
                DB::raw('COUNT(*) as count')
            )
            ->where('listened_at', '>=', Carbon::now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();
        
        // Escuchas por día de la semana
        $listensPerWeekday = (clone $query)
            ->select(
                DB::raw('DAYNAME(listened_at) as weekday'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('weekday')
            ->get();
        
        // Canciones únicas escuchadas
        $uniqueSongs = (clone $query)->distinct('song_id')->count('song_id');
        
        // Artistas únicos escuchados
        $uniqueArtists = (clone $query)
            ->join('songs', 'listens.song_id', '=', 'songs.id')
            ->distinct('songs.artist_id')
            ->count('songs.artist_id');
        
        return response()->json([
            'total_listens' => $totalListens,
            'unique_songs' => $uniqueSongs,
            'unique_artists' => $uniqueArtists,
            'top_songs' => $topSongs,
            'top_artists' => $topArtists,
            'listens_per_month' => $listensPerMonth,
            'listens_per_weekday' => $listensPerWeekday,
            'period' => [
                'start' => $request->start_date,
                'end' => $request->end_date
            ]
        ]);
    }

    /**
     * Display the specified listen.
     */
    public function show(Listen $listen)
    {
        // Verificar que el listen pertenece al usuario autenticado
        if ($listen->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json($listen->load(['song.artist']));
    }

    /**
     * Remove the specified listen from storage.
     */
    public function destroy(Listen $listen)
    {
        // Verificar que el listen pertenece al usuario autenticado
        if ($listen->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $listen->delete();
        return response()->json(null, 204);
    }
}
