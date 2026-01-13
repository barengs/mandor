<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['workspace_id', 'name', 'key', 'has_sprints', 'total_budget', 'currency'];

    protected $casts = [
        'has_sprints' => 'boolean',
        'total_budget' => 'decimal:2',
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

    public function memberBudgets()
    {
        return $this->hasMany(ProjectMemberBudget::class);
    }

    public function expenses()
    {
        return $this->hasMany(ProjectExpense::class);
    }

    /**
     * Get total allocated budget to members
     */
    public function getAllocatedBudgetAttribute()
    {
        return $this->memberBudgets()->sum('total_amount');
    }

    /**
     * Get total expenses
     */
    public function getTotalExpensesAttribute()
    {
        return $this->expenses()->sum('amount');
    }

    /**
     * Get remaining budget
     */
    public function getRemainingBudgetAttribute()
    {
        return $this->total_budget - $this->total_expenses;
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
