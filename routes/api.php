<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectStatusController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WorkspaceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::apiResource('workspaces', WorkspaceController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('project-statuses', ProjectStatusController::class); // Managing columns
    
    Route::post('/project-statuses/reorder', [ProjectStatusController::class, 'reorder']);
    Route::post('/tasks/reorder', [TaskController::class, 'reorder']);
    Route::apiResource('tasks', TaskController::class);

    Route::apiResource('comments', CommentController::class)->only(['index', 'store', 'destroy']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
