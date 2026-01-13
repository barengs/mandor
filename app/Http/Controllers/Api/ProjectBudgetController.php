<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMemberBudget;
use App\Models\ProjectExpense;
use Illuminate\Http\Request;

class ProjectBudgetController extends Controller
{
    /**
     * Get project budget overview
     */
    public function index(Project $project)
    {
        $memberBudgets = $project->memberBudgets()
            ->with('user:id,name,email')
            ->get();

        $expenses = $project->expenses()
            ->with('user:id,name')
            ->orderBy('expense_date', 'desc')
            ->get();

        $allocatedBudget = $memberBudgets->sum('total_amount');
        $totalExpenses = $expenses->sum('amount');

        return response()->json([
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'total_budget' => (float) $project->total_budget,
                'currency' => $project->currency,
            ],
            'summary' => [
                'total_budget' => (float) $project->total_budget,
                'allocated_budget' => (float) $allocatedBudget,
                'unallocated_budget' => (float) ($project->total_budget - $allocatedBudget),
                'total_expenses' => (float) $totalExpenses,
                'remaining_budget' => (float) ($project->total_budget - $totalExpenses),
            ],
            'member_budgets' => $memberBudgets,
            'expenses' => $expenses,
        ]);
    }

    /**
     * Update project budget settings
     */
    public function updateBudget(Request $request, Project $project)
    {
        $validated = $request->validate([
            'total_budget' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
        ]);

        $project->update([
            'total_budget' => $validated['total_budget'],
            'currency' => $validated['currency'] ?? $project->currency,
        ]);

        return response()->json([
            'message' => 'Budget updated successfully',
            'data' => $project,
        ]);
    }

    /**
     * Add or update member budget
     */
    public function storeMemberBudget(Request $request, Project $project)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|string|max:100',
            'rate' => 'required|numeric|min:0',
            'rate_type' => 'required|in:hourly,daily,monthly,fixed',
            'hours_allocated' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $memberBudget = ProjectMemberBudget::updateOrCreate(
            [
                'project_id' => $project->id,
                'user_id' => $validated['user_id'],
            ],
            $validated
        );

        $memberBudget->load('user:id,name,email');

        return response()->json([
            'message' => 'Member budget saved successfully',
            'data' => $memberBudget,
        ], 201);
    }

    /**
     * Delete member budget
     */
    public function destroyMemberBudget(Project $project, ProjectMemberBudget $budget)
    {
        if ($budget->project_id !== $project->id) {
            return response()->json(['message' => 'Budget not found'], 404);
        }

        $budget->delete();

        return response()->json(['message' => 'Member budget deleted successfully']);
    }

    /**
     * Add expense
     */
    public function storeExpense(Request $request, Project $project)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:500',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
        ]);

        $expense = $project->expenses()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        $expense->load('user:id,name');

        return response()->json([
            'message' => 'Expense added successfully',
            'data' => $expense,
        ], 201);
    }

    /**
     * Delete expense
     */
    public function destroyExpense(Project $project, ProjectExpense $expense)
    {
        if ($expense->project_id !== $project->id) {
            return response()->json(['message' => 'Expense not found'], 404);
        }

        $expense->delete();

        return response()->json(['message' => 'Expense deleted successfully']);
    }
}
