<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'project_id',
        'status_id',
        'creator_id',
        'title',
        'description',
        'priority',
        'start_date',
        'due_date',
        'order',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'due_date' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function status()
    {
        return $this->belongsTo(ProjectStatus::class, 'status_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'task_assignees')
            ->withTimestamps();
    }
}
