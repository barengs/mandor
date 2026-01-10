<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectStatusResource;
use App\Models\Project;
use App\Models\ProjectStatus;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectStatusController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $statuses = ProjectStatus::where('project_id', $validated['project_id'])
            ->orderBy('order')
            ->get();

        return ProjectStatusResource::collection($statuses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7', // Hex color #RRGGBB
        ]);

        // Get max order + 1
        $maxOrder = ProjectStatus::where('project_id', $validated['project_id'])->max('order') ?? 0;

        $status = ProjectStatus::create([
            'project_id' => $validated['project_id'],
            'name' => $validated['name'],
            'color' => $validated['color'],
            'order' => $maxOrder + 1,
        ]);

        return new ProjectStatusResource($status);
    }

    public function show(ProjectStatus $projectStatus)
    {
        return new ProjectStatusResource($projectStatus);
    }

    public function update(Request $request, ProjectStatus $projectStatus)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'color' => 'sometimes|string|max:7',
        ]);

        $projectStatus->update($validated);

        return new ProjectStatusResource($projectStatus);
    }

    public function destroy(ProjectStatus $projectStatus)
    {
        // Don't delete if it has tasks
        if ($projectStatus->tasks()->exists()) {
            return response()->json(['message' => 'Cannot delete status with tasks'], 409);
        }

        $projectStatus->delete();

        return response()->noContent();
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:project_statuses,id',
            'items.*.order' => 'required|integer',
        ]);

        foreach ($validated['items'] as $item) {
            ProjectStatus::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Statuses reordered successfully']);
    }
}
