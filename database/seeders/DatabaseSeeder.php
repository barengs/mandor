<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Project;
use App\Models\ProjectStatus;
use App\Models\Task;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
// use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Users
        $admin = User::firstOrCreate([
            'email' => 'admin@mandor.app',
        ], [
            'name' => 'Admin Mandor',
            'password' => bcrypt('password'),
        ]);

        $pm = User::firstOrCreate([
            'email' => 'pm@mandor.app',
        ], [
            'name' => 'Project Manager',
            'password' => bcrypt('password'),
        ]);

        $dev1 = User::firstOrCreate([
            'email' => 'frontend@mandor.app',
        ], [
            'name' => 'Frontend Dev',
            'password' => bcrypt('password'),
        ]);

        $dev2 = User::firstOrCreate([
            'email' => 'backend@mandor.app',
        ], [
            'name' => 'Backend Dev',
            'password' => bcrypt('password'),
        ]);

        // 2. Setup Spatie Roles
        app()['cache']->forget('spatie.permission.cache');
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'member']);
        
        $admin->assignRole('admin');
        $pm->assignRole('member');
        $dev1->assignRole('member');
        $dev2->assignRole('member');

        // 3. Create Workspace
        $workspace = Workspace::firstOrCreate([
            'name' => 'Mandor HQ',
            'owner_id' => $admin->id,
        ]);

        // Add members to workspace
        $workspace->members()->syncWithoutDetaching([
            $pm->id => ['role' => 'admin'],
            $dev1->id => ['role' => 'member'],
            $dev2->id => ['role' => 'member'],
        ]);

        // 4. Create Project
        $project = Project::firstOrCreate([
            'workspace_id' => $workspace->id,
            'key' => 'MDR',
        ], [
            'name' => 'Mandor App Development',
        ]);

        // 5. Create Statuses
        $todo = ProjectStatus::firstOrCreate(['project_id' => $project->id, 'name' => 'To Do'], ['color' => '#cbd5e1', 'order' => 1]);
        $inProgress = ProjectStatus::firstOrCreate(['project_id' => $project->id, 'name' => 'In Progress'], ['color' => '#3b82f6', 'order' => 2]);
        $review = ProjectStatus::firstOrCreate(['project_id' => $project->id, 'name' => 'In Review'], ['color' => '#eab308', 'order' => 3]);
        $done = ProjectStatus::firstOrCreate(['project_id' => $project->id, 'name' => 'Done'], ['color' => '#22c55e', 'order' => 4]);

        // 6. Create Tasks
        $task1 = Task::firstOrCreate([
            'project_id' => $project->id,
            'title' => 'Setup Laravel Project',
        ], [
            'status_id' => $done->id,
            'creator_id' => $pm->id,
            'description' => 'Initialize fresh Laravel 11 project with Sanctum.',
            'priority' => 'High',
            'due_date' => now()->subDay(),
            'order' => 1,
        ]);
        $task1->assignees()->syncWithoutDetaching([$dev2->id]);

        $task2 = Task::firstOrCreate([
            'project_id' => $project->id,
            'title' => 'Design Database Schema',
        ], [
            'status_id' => $done->id,
            'creator_id' => $pm->id,
            'description' => 'Create ERD and Migrations.',
            'priority' => 'Urgent',
            'due_date' => now()->subHours(5),
            'order' => 2,
        ]);
        $task2->assignees()->syncWithoutDetaching([$dev2->id]);

        $task3 = Task::firstOrCreate([
            'project_id' => $project->id,
            'title' => 'Implement Task API',
        ], [
            'status_id' => $review->id,
            'creator_id' => $pm->id,
            'description' => 'CRUD for tasks and assignees.',
            'priority' => 'High',
            'due_date' => now()->addDay(),
            'order' => 1,
        ]);
        $task3->assignees()->syncWithoutDetaching([$dev2->id]);

        $task4 = Task::firstOrCreate([
            'project_id' => $project->id,
            'title' => 'Frontend Login Page',
        ], [
            'status_id' => $inProgress->id,
            'creator_id' => $pm->id,
            'description' => 'Slicing login page with React.',
            'priority' => 'Medium',
            'due_date' => now()->addDays(2),
            'order' => 1,
        ]);
        $task4->assignees()->syncWithoutDetaching([$dev1->id]);

        $task5 = Task::firstOrCreate([
            'project_id' => $project->id,
            'title' => 'Kanban Drag & Drop',
        ], [
            'status_id' => $todo->id,
            'creator_id' => $pm->id,
            'description' => 'Implement DnD library in frontend.',
            'priority' => 'Medium',
            'due_date' => now()->addDays(5),
            'order' => 1,
        ]);

        // 7. Comments
        Comment::create([
            'task_id' => $task3->id,
            'user_id' => $pm->id,
            'content' => 'Please Make sure to cover edge cases.',
        ]);
        Comment::create([
            'task_id' => $task3->id,
            'user_id' => $dev2->id,
            'content' => 'Will do, currently writing tests.',
        ]);

        $this->call([
            RolePermissionSeeder::class,
        ]);
    }
}
