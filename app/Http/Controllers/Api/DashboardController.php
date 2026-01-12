<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
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
        
        // Use Carbon for consistent date handling
        $today = now()->toDateString();
        
        // Today's Tasks
        $todaysTasks = Task::whereHas('project', function($q) use ($allWorkspaceIds) {
                $q->whereIn('workspace_id', $allWorkspaceIds);
            })
            ->with(['status', 'project'])
            ->whereDate('due_date', $today)
            ->get();
            
        // Overdue Tasks
        $overdueTasks = Task::whereHas('project', function($q) use ($allWorkspaceIds) {
                $q->whereIn('workspace_id', $allWorkspaceIds);
            })
            ->with(['status', 'project'])
            ->whereDate('due_date', '<', $today)
            ->whereHas('status', function($q) {
                $q->where('name', 'not like', '%Done%')
                  ->where('name', 'not like', '%Complete%');
            })
            ->get();

        // Recent Workspaces with counts including todo
        $recentWorkspaces = Workspace::whereIn('id', $allWorkspaceIds)
            ->with('owner')
            ->withCount('projects')
            ->orderBy('updated_at', 'desc')
            ->take(3)
            ->get()
            ->map(function($workspace) {
                $taskCount = Task::whereHas('project', function($q) use ($workspace) {
                    $q->where('workspace_id', $workspace->id);
                })->count();
                
                // Count todo tasks (status name like 'To Do')
                $todoCount = Task::whereHas('project', function($q) use ($workspace) {
                    $q->where('workspace_id', $workspace->id);
                })->whereHas('status', function($q) {
                    $q->where('name', 'like', '%To Do%');
                })->count();
                
                return [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'owner' => $workspace->owner ? [
                        'id' => $workspace->owner->id,
                        'name' => $workspace->owner->name,
                    ] : null,
                    'projects_count' => $workspace->projects_count,
                    'tasks_count' => $taskCount,
                    'todo_count' => $todoCount,
                ];
            });
            
        return response()->json([
            'greeting' => 'Welcome back, ' . $user->name,
            'stats' => [
                'tasks_due_today' => $todaysTasks->count(),
                'tasks_overdue' => $overdueTasks->count(),
            ],
            'todays_tasks' => TaskResource::collection($todaysTasks),
            'overdue_tasks' => TaskResource::collection($overdueTasks),
            'recent_workspaces' => $recentWorkspaces,
        ]);
    }
}
