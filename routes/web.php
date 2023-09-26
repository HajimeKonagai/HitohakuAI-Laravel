<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function ()
{
    Route::get('/', App\Http\Controllers\DataController::class)->name('/');
    Route::get('data/create', [App\Http\Controllers\DataController::class, 'create'])->name('data.create');
    Route::get('data/bulk',   [App\Http\Controllers\DataController::class, 'bulk'])->name('data.bulk');
    Route::get('data/edit/{data?}',   [App\Http\Controllers\DataController::class, 'edit'])->name('data.edit');

    Route::get('annotation', \App\Http\Controllers\AnnotationController::class)->name('annotation'); // TODO: auth admin or by user
    Route::get('annotation/{annotation?}', [\App\Http\Controllers\AnnotationController::class, 'edit'])->name('annotation.edit');
});

Route::middleware(['auth', 'can:is_admin'])->group(function ()
{
    Route::get('user', \App\Http\Controllers\UserController::class)->name('user'); // TODO: auth admin or by user
    Route::get('user/{user}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('user.edit'); // TODO: auth admin or by user
    Route::put('user/{user}/password', [\App\Http\Controllers\UserController::class, 'password_update'])->name('user.password_update');
    Route::patch('user/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('user.update');
    Route::delete('user/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('user.destroy');

});



require __DIR__.'/auth.php';
