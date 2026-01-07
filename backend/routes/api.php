<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SongController;
use App\Http\Controllers\ArtistController;
use App\Http\Controllers\ListenController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\RecommendationController;

// Public user routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Song protected routes
    Route::get('/songs/get/{song}', [SongController::class, 'show']);
    Route::get('/songs', [SongController::class, 'index']);
    Route::post('/songs/create', [SongController::class, 'store']);
    Route::patch('/songs/update/{song}', [SongController::class, 'update']);
    Route::delete('/songs/delete/{song}', [SongController::class, 'destroy']);

    // Artist protected routes
    Route::get('/artists/get/{artist}', [ArtistController::class, 'show']);
    Route::get('/artists', [ArtistController::class, 'index']);
    Route::post('/artists/create', [ArtistController::class, 'store']);
    Route::patch('/artists/update/{artist}', [ArtistController::class, 'update']);
    Route::delete('/artists/delete/{artist}', [ArtistController::class, 'destroy']);

    // Listen protected routes
    Route::get('/listens', [ListenController::class, 'index']);
    Route::post('/listens/create', [ListenController::class, 'store']);
    Route::get('/listens/statistics', [ListenController::class, 'statistics']);
    Route::get('/listens/{listen}', [ListenController::class, 'show']);
    Route::delete('/listens/{listen}', [ListenController::class, 'destroy']);

    // Playlist protected routes
    Route::get('/playlists', [PlaylistController::class, 'index']);
    Route::post('/playlists/create', [PlaylistController::class, 'store']);
    Route::get('/playlists/{playlist}', [PlaylistController::class, 'show']);
    Route::patch('/playlists/{playlist}', [PlaylistController::class, 'update']);
    Route::delete('/playlists/{playlist}', [PlaylistController::class, 'destroy']);
    Route::post('/playlists/{playlist}/songs', [PlaylistController::class, 'addSong']);
    Route::delete('/playlists/{playlist}/songs', [PlaylistController::class, 'removeSong']);

    // Friendship routes
    Route::get('/friends/search', [FriendshipController::class, 'searchUsers']);
    Route::post('/friends/send-request', [FriendshipController::class, 'sendRequest']);
    Route::get('/friends/pending', [FriendshipController::class, 'getPendingRequests']);
    Route::post('/friends/accept/{friendshipId}', [FriendshipController::class, 'acceptRequest']);
    Route::delete('/friends/reject/{friendshipId}', [FriendshipController::class, 'rejectRequest']);
    Route::get('/friends', [FriendshipController::class, 'getFriends']);
    Route::delete('/friends/remove/{friendId}', [FriendshipController::class, 'removeFriend']);
    Route::get('/friends/{friendId}/stats', [FriendshipController::class, 'getFriendStats']);

    // Recommendations route
    Route::get('/recommendations', [RecommendationController::class, 'getRecommendations']);
});