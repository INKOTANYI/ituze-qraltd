<?php

use App\Http\Controllers\Admin\ApprovalController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfileCompletionController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\UnitController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'profile.complete'])->name('dashboard');

Route::middleware(['auth', 'profile.complete'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/complete-profile', function () {
        return Inertia::render('Profile/Complete');
    })->name('profile.complete');
    Route::post('/complete-profile', [ProfileCompletionController::class, 'store'])->name('profile.complete.store');

    Route::get('/api/provinces', [LocationController::class, 'provinces'])->name('api.provinces');
    Route::get('/api/districts/{province}', [LocationController::class, 'districts'])->name('api.districts');
    Route::get('/api/sectors/{district}', [LocationController::class, 'sectors'])->name('api.sectors');
    Route::get('/api/cells/{sector}', [LocationController::class, 'cells'])->name('api.cells');
    Route::get('/api/unit-types', function () {
        return response()->json(\App\Models\UnitType::all(['id', 'name']));
    })->name('api.unit-types');

    Route::get('/api/property-types', function () {
        return response()->json(\App\Models\PropertyType::all(['id', 'name']));
    })->name('api.property-types');

    // Property management routes
    Route::prefix('properties')->name('properties.')->group(function () {
        Route::get('/', [PropertyController::class, 'index'])->name('index');
        Route::get('/create', [PropertyController::class, 'create'])->name('create');
        Route::post('/', [PropertyController::class, 'store'])->name('store');
        Route::get('/{property}', [PropertyController::class, 'show'])->name('show');
        Route::get('/{property}/edit', [PropertyController::class, 'edit'])->name('edit');
        Route::put('/{property}', [PropertyController::class, 'update'])->name('update');
        Route::delete('/{property}', [PropertyController::class, 'destroy'])->name('destroy');

        // Unit management routes (nested under properties)
        Route::prefix('{property}/units')->name('units.')->group(function () {
            Route::get('/', [UnitController::class, 'index'])->name('index');
            Route::get('/create', [UnitController::class, 'create'])->name('create');
            Route::post('/', [UnitController::class, 'store'])->name('store');
            Route::get('/{unit}', [UnitController::class, 'show'])->name('show');
            Route::get('/{unit}/edit', [UnitController::class, 'edit'])->name('edit');
            Route::put('/{unit}', [UnitController::class, 'update'])->name('update');
            Route::delete('/{unit}', [UnitController::class, 'destroy'])->name('destroy');
        });
    });

    Route::post('/api/ai/generate-property-description', [\App\Http\Controllers\AIDescriptionController::class, 'generatePropertyDescription'])->name('api.ai.generate-property-description');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/approvals', [ApprovalController::class, 'index'])->name('approvals');
    Route::post('/approvals/{user}/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
    Route::post('/approvals/{user}/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');

    Route::get('/users', [AdminUserController::class, 'index'])->name('users');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    Route::get('/users/export/excel', [AdminUserController::class, 'exportExcel'])->name('users.export.excel');
    Route::get('/users/export/pdf', [AdminUserController::class, 'exportPdf'])->name('users.export.pdf');
});

if (app()->environment('local')) {
    Route::post('/dev/verify-email', function (\Illuminate\Http\Request $request) {
        $request->user()->markEmailAsVerified();

        return redirect()->route('dashboard');
    })->middleware('auth')->name('dev.verify-email');
}

require __DIR__.'/auth.php';