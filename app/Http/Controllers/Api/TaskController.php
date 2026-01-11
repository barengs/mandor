<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        // TODO: Authorization (check if user is in project's workspace)

        $tasks = Task::where('project_id', $validated['project_id'])
            ->with(['status', 'creator', 'assignees'])
            ->get();

        return TaskResource::collection($tasks);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'status_id' => 'required|exists:project_statuses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:Low,Medium,High,Urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'assignee_ids' => 'nullable|array',
            'assignee_ids.*' => 'exists:users,id',
        ]);

        $project = Project::find($validated['project_id']);
        // TODO: Check if user belongs to project workspace

        $task = Task::create([
            'project_id' => $validated['project_id'],
            'status_id' => $validated['status_id'],
            'creator_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'],
            'start_date' => $validated['start_date'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
        ]);

        if (!empty($validated['assignee_ids'])) {
            // TODO: Validate that assignees are members of the workspace
            $task->assignees()->sync($validated['assignee_ids']);
        }

        return new TaskResource($task->load(['status', 'creator', 'assignees']));
    }

    public function show(Task $task)
    {
        return new TaskResource($task->load(['status', 'creator', 'assignees']));
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'status_id' => 'sometimes|exists:project_statuses,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:Low,Medium,High,Urgent',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'assignee_ids' => 'sometimes|array',
            'assignee_ids.*' => 'exists:users,id',
        ]);

        $task->update($validated);

        if (isset($validated['assignee_ids'])) {
            $task->assignees()->sync($validated['assignee_ids']);
        }

        return new TaskResource($task->load(['status', 'creator', 'assignees']));
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return response()->noContent();
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:tasks,id',
            'items.*.status_id' => 'required|exists:project_statuses,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            Task::where('id', $item['id'])->update([
                'status_id' => $item['status_id'],
                'order' => $item['order'],
            ]);
        }

        return response()->json(['message' => 'Tasks reordered successfully']);
    }
}
