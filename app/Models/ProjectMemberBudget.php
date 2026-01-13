<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMemberBudget extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'role',
        'rate',
        'rate_type',
        'hours_allocated',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'hours_allocated' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
