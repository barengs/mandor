<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * List all roles with permissions
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'data' => $roles->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name'),
                    'users_count' => $role->users()->count(),
                    'created_at' => $role->created_at,
                ];
            }),
        ]);
    }

    /**
     * Create a new role
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role created successfully',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
        ], 201);
    }

    /**
     * Show a role
     */
    public function show(Role $role)
    {
        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users()->count(),
            ],
        ]);
    }

    /**
     * Update a role
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|unique:roles,name,' . $role->id,
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if (isset($validated['name'])) {
            $role->name = $validated['name'];
            $role->save();
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ],
        ]);
    }

    /**
     * Delete a role
     */
    public function destroy(Role $role)
    {
        // Prevent deleting system roles
        if (in_array($role->name, ['Super Admin', 'Admin'])) {
            return response()->json(['message' => 'Cannot delete system roles'], 403);
        }

        $role->delete();

        return response()->noContent();
    }

    /**
     * List all permissions
     */
    public function permissions()
    {
        $permissions = Permission::all();

        // Group permissions by resource
        $grouped = $permissions->groupBy(function ($permission) {
            $parts = explode(' ', $permission->name);
            return $parts[1] ?? $permission->name; // e.g., "view users" -> "users"
        });

        return response()->json([
            'data' => $permissions->pluck('name'),
            'grouped' => $grouped->map(fn($perms) => $perms->pluck('name')),
        ]);
    }
}
