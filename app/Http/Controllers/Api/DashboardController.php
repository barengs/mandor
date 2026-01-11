<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Http\Resources\WorkspaceResource;
use App\Models\Task;
use App\Models\Workspace;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get all workspace IDs user has access to (owned + member)
        $ownedWorkspaceIds = $user->ownedWorkspaces()->pluck('id');
        $memberWorkspaceIds = $user->workspaces()->pluck('workspaces.id');
        $allWorkspaceIds = $ownedWorkspaceIds->merge($memberWorkspaceIds)->unique();
        
        // 1. Tasks in user's workspaces (Today & Overdue)
        $today = now()->startOfDay();
        
        $todaysTasks = Task::whereHas('project', function($q) use ($allWorkspaceIds) {
                $q->whereIn('workspace_id', $allWorkspaceIds);
            })
            ->with(['status', 'project'])
            ->whereDate('due_date', $today)
            ->get();
            
        $overdueTasks = Task::whereHas('project', function($q) use ($allWorkspaceIds) {
                $q->whereIn('workspace_id', $allWorkspaceIds);
            })
            ->with(['status', 'project'])
            ->where('due_date', '<', now())
            ->whereDoesntHave('status', function($q) {
                $q->where('name', 'like', '%Done%')
                  ->orWhere('name', 'like', '%Complete%');
            })
            ->get();

        // 2. Recent Workspaces (owned + member)
        $recentWorkspaces = Workspace::whereIn('id', $allWorkspaceIds)
            ->with('owner')
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
