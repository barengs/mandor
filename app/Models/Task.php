<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'project_id',
        'status_id',
        'sprint_id',
        'creator_id',
        'title',
        'description',
        'priority',
        'start_date',
        'due_date',
        'order',
    ];

    protected $casts = [
        'project_id' => 'integer',
        'status_id' => 'integer',
        'sprint_id' => 'integer',
        'creator_id' => 'integer',
        'order' => 'integer',
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

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
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

    /**
     * Check if task is in backlog
     */
    public function isBacklog(): bool
    {
        return is_null($this->sprint_id);
    }

    /**
     * Scope for backlog tasks
     */
    public function scopeBacklog($query)
    {
        return $query->whereNull('sprint_id');
    }

    /**
     * Scope for tasks in a specific sprint
     */
    public function scopeInSprint($query, $sprintId)
    {
        return $query->where('sprint_id', $sprintId);
    }
}
