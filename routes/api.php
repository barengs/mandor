<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProjectBudgetController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectStatusController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SprintController;
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
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
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

    // Sprint Management
    Route::get('/projects/{project}/sprints', [SprintController::class, 'index']);
    Route::post('/projects/{project}/sprints', [SprintController::class, 'store']);
    Route::get('/projects/{project}/sprints/{sprint}', [SprintController::class, 'show']);
    Route::put('/projects/{project}/sprints/{sprint}', [SprintController::class, 'update']);
    Route::delete('/projects/{project}/sprints/{sprint}', [SprintController::class, 'destroy']);
    Route::post('/projects/{project}/sprints/{sprint}/start', [SprintController::class, 'start']);
    Route::post('/projects/{project}/sprints/{sprint}/complete', [SprintController::class, 'complete']);
    Route::get('/projects/{project}/backlog', [SprintController::class, 'backlog']);
    Route::post('/projects/{project}/move-task', [SprintController::class, 'moveTask']);
    Route::post('/projects/{project}/sprints/reorder', [SprintController::class, 'reorder']);

    Route::apiResource('comments', CommentController::class)->only(['index', 'store', 'destroy']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);

    // Chat Messages
    Route::get('/projects/{project}/messages', [MessageController::class, 'index']);
    Route::post('/projects/{project}/messages', [MessageController::class, 'store']);
    Route::delete('/projects/{project}/messages/{message}', [MessageController::class, 'destroy']);
    Route::get('/projects/{project}/messages/poll', [MessageController::class, 'poll']);

    // Project Budget Management
    Route::get('/projects/{project}/budget', [ProjectBudgetController::class, 'index']);
    Route::put('/projects/{project}/budget', [ProjectBudgetController::class, 'updateBudget']);
    Route::post('/projects/{project}/budget/members', [ProjectBudgetController::class, 'storeMemberBudget']);
    Route::delete('/projects/{project}/budget/members/{budget}', [ProjectBudgetController::class, 'destroyMemberBudget']);
    Route::post('/projects/{project}/budget/expenses', [ProjectBudgetController::class, 'storeExpense']);
    Route::delete('/projects/{project}/budget/expenses/{expense}', [ProjectBudgetController::class, 'destroyExpense']);
    
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
