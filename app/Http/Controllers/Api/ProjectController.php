<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\ProjectStatus;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id',
        ]);

        // TODO: Check if user belongs to workspace

        $projects = Project::where('workspace_id', $validated['workspace_id'])->get();

        return ProjectResource::collection($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id',
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:10|unique:projects,key',
        ]);

        // TODO: Authorization

        $project = Project::create($validated);

        // Create default statuses
        $defaultStatuses = [
            ['name' => 'To Do', 'color' => '#6B7280', 'order' => 1],
            ['name' => 'In Progress', 'color' => '#3B82F6', 'order' => 2],
            ['name' => 'Code Review', 'color' => '#8B5CF6', 'order' => 3],
            ['name' => 'QA', 'color' => '#F59E0B', 'order' => 4],
            ['name' => 'Done', 'color' => '#10B981', 'order' => 5],
        ];

        foreach ($defaultStatuses as $status) {
            ProjectStatus::create([
                'project_id' => $project->id,
                ...$status,
            ]);
        }

        return new ProjectResource($project);
    }

    public function show(Project $project)
    {
        return new ProjectResource($project);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'key' => 'sometimes|string|max:10|unique:projects,key,' . $project->id,
        ]);

        $project->update($validated);

        return new ProjectResource($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return response()->noContent();
    }
}
