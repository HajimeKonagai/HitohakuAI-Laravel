<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



Route::middleware('auth')->name('api.')->group(function ()
{
    Route::get('data/index', [ App\Http\Controllers\DataController::class, 'search'])->name('data.search');
    Route::get('data/all', [ App\Http\Controllers\DataController::class, 'all'])->name('data.all');
    Route::post('data/{data?}', [ App\Http\Controllers\DataController::class, 'save'])->name('data.save');
    Route::delete('data/{data}', [ App\Http\Controllers\DataController::class, 'delete'])->name('data.delete');

    Route::post('suggestion', App\Http\Controllers\Api\SuggestController::class)->name('suggestion');
    Route::post('ocr', App\Http\Controllers\Api\OcrController::class)->name('ocr');

    Route::get('annotation', [\App\Http\Controllers\AnnotationController::class, 'index'])->name('annotation.search');
    Route::post('annotation/{annotation}', [App\Http\Controllers\AnnotationController::class, 'update'])->name('annotation.update');
});


Route::middleware(['auth', 'can:is_admin'])->name('api.')->group(function ()
{
    Route::get('user', [\App\Http\Controllers\UserController::class, 'search'])->name('user.search'); // TODO: auth admin or by user

});