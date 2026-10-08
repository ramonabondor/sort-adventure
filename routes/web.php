<?php
use App\Http\Controllers\GameController;
use Illuminate\Support\Facades\Route;
Route::get('/', [GameController::class, 'index'])->block(10, 10);
Route::get('/game/state', [GameController::class, 'state'])->block(10, 10);
Route::post('/game/start', [GameController::class, 'start'])->block(10, 10);
Route::post('/game/move', [GameController::class, 'move'])->block(10, 10);
