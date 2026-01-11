<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions
        $permissions = [
            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // Role Management
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            
            // Workspace Management
            'view workspaces',
            'create workspaces',
            'edit workspaces',
            'delete workspaces',
            
            // Project Management
            'view projects',
            'create projects',
            'edit projects',
            'delete projects',
            
            // Task Management
            'view tasks',
            'create tasks',
            'edit tasks',
            'delete tasks',
            'assign tasks',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles and assign permissions
        
        // Super Admin - has all permissions
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - can manage most things except roles
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $admin->givePermissionTo([
            'view users', 'create users', 'edit users',
            'view roles',
            'view workspaces', 'create workspaces', 'edit workspaces', 'delete workspaces',
            'view projects', 'create projects', 'edit projects', 'delete projects',
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks', 'assign tasks',
        ]);

        // Project Manager - can manage projects and tasks
        $pm = Role::firstOrCreate(['name' => 'Project Manager', 'guard_name' => 'web']);
        $pm->givePermissionTo([
            'view users',
            'view workspaces',
            'view projects', 'create projects', 'edit projects',
            'view tasks', 'create tasks', 'edit tasks', 'delete tasks', 'assign tasks',
        ]);

        // Developer - can view and work on tasks
        $developer = Role::firstOrCreate(['name' => 'Developer', 'guard_name' => 'web']);
        $developer->givePermissionTo([
            'view users',
            'view workspaces',
            'view projects',
            'view tasks', 'create tasks', 'edit tasks',
        ]);

        // Viewer - read only
        $viewer = Role::firstOrCreate(['name' => 'Viewer', 'guard_name' => 'web']);
        $viewer->givePermissionTo([
            'view users',
            'view workspaces',
            'view projects',
            'view tasks',
        ]);
    }
}
