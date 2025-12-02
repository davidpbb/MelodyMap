<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SongController;
use App\Http\Controllers\ArtistController;

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
});