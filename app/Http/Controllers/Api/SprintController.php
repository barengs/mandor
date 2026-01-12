<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SprintResource;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    /**
     * Get all sprints for a project
     */
    public function index(Project $project)
    {
        $sprints = $project->sprints()
            ->withCount('tasks')
            ->get();

        return SprintResource::collection($sprints);
    }

    /**
     * Create a new sprint
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        // Get next order
        $maxOrder = $project->sprints()->max('order') ?? 0;
        $validated['order'] = $maxOrder + 1;

        $sprint = $project->sprints()->create($validated);

        return new SprintResource($sprint->loadCount('tasks'));
    }

    /**
     * Get a specific sprint
     */
    public function show(Project $project, Sprint $sprint)
    {
        $sprint->loadCount('tasks');
        $sprint->load(['tasks' => function ($query) {
            $query->with(['status', 'assignees'])->orderBy('order');
        }]);

        return new SprintResource($sprint);
    }

    /**
     * Update a sprint
     */
    public function update(Request $request, Project $project, Sprint $sprint)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'goal' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'sometimes|in:planning,active,completed',
        ]);

        // If setting to active, deactivate other active sprints
        if (isset($validated['status']) && $validated['status'] === 'active') {
            $project->sprints()->active()->update(['status' => 'planning']);
        }

        $sprint->update($validated);

        return new SprintResource($sprint->loadCount('tasks'));
    }

    /**
     * Delete a sprint (moves tasks to backlog)
     */
    public function destroy(Project $project, Sprint $sprint)
    {
        // Move all tasks to backlog before deleting
        $sprint->tasks()->update(['sprint_id' => null]);
        
        $sprint->delete();

        return response()->json(['message' => 'Sprint deleted successfully']);
    }

    /**
     * Start a sprint (set to active)
     */
    public function start(Project $project, Sprint $sprint)
    {
        if ($sprint->status !== 'planning') {
            return response()->json(['message' => 'Only planning sprints can be started'], 422);
        }

        // Deactivate other active sprints
        $project->sprints()->active()->update(['status' => 'planning']);

        $sprint->update(['status' => 'active']);

        return new SprintResource($sprint->loadCount('tasks'));
    }

    /**
     * Complete a sprint
     */
    public function complete(Request $request, Project $project, Sprint $sprint)
    {
        if ($sprint->status !== 'active') {
            return response()->json(['message' => 'Only active sprints can be completed'], 422);
        }

        $validated = $request->validate([
            'move_incomplete_to' => 'nullable|in:backlog,next_sprint',
            'next_sprint_id' => 'nullable|exists:sprints,id',
        ]);

        // Handle incomplete tasks
        $incompleteTasks = $sprint->tasks()
            ->whereHas('status', function ($query) {
                $query->where('name', '!=', 'Done');
            })
            ->get();

        if ($incompleteTasks->count() > 0) {
            $moveToSprintId = null;
            
            if (($validated['move_incomplete_to'] ?? 'backlog') === 'next_sprint' && isset($validated['next_sprint_id'])) {
                $moveToSprintId = $validated['next_sprint_id'];
            }

            $incompleteTasks->each(function ($task) use ($moveToSprintId) {
                $task->update(['sprint_id' => $moveToSprintId]);
            });
        }

        $sprint->update(['status' => 'completed']);

        return new SprintResource($sprint->loadCount('tasks'));
    }

    /**
     * Get backlog tasks for a project
     */
    public function backlog(Project $project)
    {
        $tasks = $project->backlogTasks()
            ->with(['status', 'assignees', 'creator'])
            ->orderBy('order')
            ->get();

        return response()->json([
            'tasks' => \App\Http\Resources\TaskResource::collection($tasks),
        ]);
    }

    /**
     * Move task to sprint or backlog
     */
    public function moveTask(Request $request, Project $project)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'sprint_id' => 'nullable|exists:sprints,id',
        ]);

        $task = $project->tasks()->findOrFail($validated['task_id']);
        $task->update(['sprint_id' => $validated['sprint_id']]);

        return response()->json(['message' => 'Task moved successfully']);
    }

    /**
     * Reorder sprints
     */
    public function reorder(Request $request, Project $project)
    {
        $validated = $request->validate([
            'sprints' => 'required|array',
            'sprints.*.id' => 'required|exists:sprints,id',
            'sprints.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['sprints'] as $sprintData) {
            $project->sprints()
                ->where('id', $sprintData['id'])
                ->update(['order' => $sprintData['order']]);
        }

        return response()->json(['message' => 'Sprints reordered successfully']);
    }
}
