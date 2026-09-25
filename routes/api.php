<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LocationController;

Route::get('/provinces', [LocationController::class, 'provinces'])->name('api.provinces');
Route::get('/districts/{province}', [LocationController::class, 'districts'])->name('api.districts');
Route::get('/sectors/{district}', [LocationController::class, 'sectors'])->name('api.sectors');
Route::get('/cells/{sector}', [LocationController::class, 'cells'])->name('api.cells');
