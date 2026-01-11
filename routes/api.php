<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectStatusController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\WorkspaceMemberController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::apiResource('workspaces', WorkspaceController::class);
    
    // Workspace Members
    Route::get('/workspaces/{workspace}/members', [WorkspaceMemberController::class, 'index']);
    Route::post('/workspaces/{workspace}/members', [WorkspaceMemberController::class, 'store']);
    Route::put('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'update']);
    Route::delete('/workspaces/{workspace}/members/{user}', [WorkspaceMemberController::class, 'destroy']);
    Route::get('/workspaces/{workspace}/members/search', [WorkspaceMemberController::class, 'searchUsers']);
    
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('project-statuses', ProjectStatusController::class); // Managing columns
    
    Route::post('/project-statuses/reorder', [ProjectStatusController::class, 'reorder']);
    Route::post('/tasks/reorder', [TaskController::class, 'reorder']);
    Route::apiResource('tasks', TaskController::class);

    Route::apiResource('comments', CommentController::class)->only(['index', 'store', 'destroy']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // User Management (RBAC)
    Route::apiResource('users', UserController::class);
    Route::post('/users/{user}/roles', [UserController::class, 'assignRoles']);
    
    // Role Management
    Route::apiResource('roles', RoleController::class);
    Route::get('/permissions', [RoleController::class, 'permissions']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
