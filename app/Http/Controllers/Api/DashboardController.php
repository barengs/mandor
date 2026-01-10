<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // 1. Tasks assigned to user (Today & Overdue)
        $today = now()->startOfDay();
        
        $todaysTasks = $user->assignedTasks()
            ->with(['status', 'project'])
            ->whereDate('due_date', $today)
            ->get();
            
        $overdueTasks = $user->assignedTasks()
            ->with(['status', 'project'])
            ->where('due_date', '<', now())
            ->whereDoesntHave('status', function($q) {
                // Assuming "Done" statuses indicate completion. 
                $q->where('name', 'like', '%Done%')
                  ->orWhere('name', 'like', '%Complete%');
            })
            ->get();

        // 2. Recent Workspaces
        $recentWorkspaces = $user->workspaces()
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get();
            
        return response()->json([
            'greeting' => 'Welcome back, ' . $user->name,
            'stats' => [
                'tasks_due_today' => $todaysTasks->count(),
                'tasks_overdue' => $overdueTasks->count(),
            ],
            'todays_tasks' => TaskResource::collection($todaysTasks),
            'overdue_tasks' => TaskResource::collection($overdueTasks),
            'recent_workspaces' => WorkspaceResource::collection($recentWorkspaces),
        ]);
    }
}
