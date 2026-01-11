<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WorkspaceResource;
use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get workspaces user owns or is a member of
        $ownedWorkspaceIds = $user->ownedWorkspaces()->pluck('id');
        $memberWorkspaceIds = $user->workspaces()->pluck('workspaces.id');
        $allWorkspaceIds = $ownedWorkspaceIds->merge($memberWorkspaceIds)->unique();
        
        $workspaces = Workspace::whereIn('id', $allWorkspaceIds)
            ->with('owner')
            ->orderBy('updated_at', 'desc')
            ->get();
            
        return WorkspaceResource::collection($workspaces);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace = Workspace::create([
            'name' => $validated['name'],
            'owner_id' => $request->user()->id,
        ]);

        // Attach owner as member with admin role
        $workspace->members()->attach($request->user()->id, ['role' => 'admin']);

        return new WorkspaceResource($workspace);
    }

    public function show(Workspace $workspace)
    {
        // TODO: Add policy authorization
        return new WorkspaceResource($workspace->load('owner'));
    }

    public function update(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace->update($validated);

        return new WorkspaceResource($workspace);
    }

    public function destroy(Workspace $workspace)
    {
        $workspace->delete();

        return response()->noContent();
    }
}
