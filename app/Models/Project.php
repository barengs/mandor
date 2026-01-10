<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['workspace_id', 'name', 'key'];

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
}
