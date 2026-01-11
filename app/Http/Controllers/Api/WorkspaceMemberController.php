<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkspaceMemberController extends Controller
{
    /**
     * List all members of a workspace
     */
    public function index(Request $request, Workspace $workspace)
    {
        $members = $workspace->members()
            ->withPivot('role', 'created_at')
            ->get();

        return response()->json([
            'data' => $members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar_url' => $member->avatar_url,
                    'role' => $member->pivot->role,
                    'joined_at' => $member->pivot->created_at,
                ];
            }),
        ]);
    }

    /**
     * Add a member to workspace (by email)
     */
    public function store(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'sometimes|in:admin,member',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Check if already a member
        if ($workspace->members()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'message' => 'User is already a member of this workspace'
            ], 409);
        }

        $workspace->members()->attach($user->id, [
            'role' => $validated['role'] ?? 'member',
        ]);

        return response()->json([
            'message' => 'Member added successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $validated['role'] ?? 'member',
            ],
        ], 201);
    }

    /**
     * Update member role
     */
    public function update(Request $request, Workspace $workspace, User $user)
    {
        $validated = $request->validate([
            'role' => 'required|in:admin,member',
        ]);

        // Check if user is a member
        if (!$workspace->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User is not a member'], 404);
        }

        // Prevent changing owner's role
        if ($workspace->owner_id === $user->id) {
            return response()->json(['message' => 'Cannot change owner role'], 403);
        }

        $workspace->members()->updateExistingPivot($user->id, [
            'role' => $validated['role'],
        ]);

        return response()->json(['message' => 'Role updated successfully']);
    }

    /**
     * Remove member from workspace
     */
    public function destroy(Workspace $workspace, User $user)
    {
        // Prevent removing owner
        if ($workspace->owner_id === $user->id) {
            return response()->json(['message' => 'Cannot remove workspace owner'], 403);
        }

        // Check if user is a member
        if (!$workspace->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User is not a member'], 404);
        }

        $workspace->members()->detach($user->id);

        return response()->noContent();
    }

    /**
     * Search users to add (not already in workspace)
     */
    public function searchUsers(Request $request, Workspace $workspace)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        $existingMemberIds = $workspace->members()->pluck('users.id');

        $users = User::where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%");
            })
            ->whereNotIn('id', $existingMemberIds)
            ->limit(10)
            ->get();

        return UserResource::collection($users);
    }
}
