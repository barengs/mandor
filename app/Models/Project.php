<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['workspace_id', 'name', 'key', 'has_sprints'];

    protected $casts = [
        'has_sprints' => 'boolean',
    ];

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function statuses()
    {
        return $this->hasMany(ProjectStatus::class)->orderBy('order');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function sprints()
    {
        return $this->hasMany(Sprint::class)->orderBy('order');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get backlog tasks (tasks without sprint)
     */
    public function backlogTasks()
    {
        return $this->tasks()->whereNull('sprint_id');
    }

    /**
     * Get the active sprint
     */
    public function activeSprint()
    {
        return $this->sprints()->active()->first();
    }
}
