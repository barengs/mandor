import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { X, DollarSign, Users, Plus, Trash2, PieChart, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectBudget = ({ projectId, isOpen, onClose, members = [] }) => {
    const queryClient = useQueryClient();
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(false);
    const [budgetForm, setBudgetForm] = useState({ total_budget: 0, currency: 'IDR' });
    const [memberForm, setMemberForm] = useState({
        user_id: '',
        role: '',
        rate: 0,
        rate_type: 'monthly',
        hours_allocated: '',
        duration: 1, // months, days, or hours depending on rate_type
        total_amount: 0,
        notes: '',
    });

    // Auto-calculate total amount based on rate and duration
    const calculateTotalAmount = (rate, rateType, duration) => {
        const rateNum = parseFloat(rate) || 0;
        const durationNum = parseFloat(duration) || 0;
        
        if (rateType === 'fixed') {
            return rateNum;
        }
        return rateNum * durationNum;
    };

    // Update member form with auto-calculation
    const updateMemberForm = (field, value) => {
        const newForm = { ...memberForm, [field]: value };
        
        // Auto-calculate total when rate, rate_type, or duration changes
        if (['rate', 'rate_type', 'duration'].includes(field)) {
            newForm.total_amount = calculateTotalAmount(
                field === 'rate' ? value : newForm.rate,
                field === 'rate_type' ? value : newForm.rate_type,
                field === 'duration' ? value : newForm.duration
            );
            
            // Also update hours_allocated for hourly type
            if (newForm.rate_type === 'hourly') {
                newForm.hours_allocated = field === 'duration' ? value : newForm.duration;
            }
        }
        
        setMemberForm(newForm);
    };
    const [expenseForm, setExpenseForm] = useState({
        category: 'Labor',
        description: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
    });

    const { data, isLoading } = useQuery({
        queryKey: ['project-budget', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/budget`);
            return data;
        },
        enabled: isOpen && !!projectId,
    });

    const updateBudgetMutation = useMutation({
        mutationFn: (data) => api.put(`/projects/${projectId}/budget`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-budget', projectId] });
            setEditingBudget(false);
            toast.success('Budget updated successfully');
        },
    });

    const addMemberBudgetMutation = useMutation({
        mutationFn: (data) => api.post(`/projects/${projectId}/budget/members`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-budget', projectId] });
            setShowMemberForm(false);
            setMemberForm({ user_id: '', role: '', rate: 0, rate_type: 'monthly', hours_allocated: '', duration: 1, total_amount: 0, notes: '' });
            toast.success('Member budget added successfully');
        },
    });

    const deleteMemberBudgetMutation = useMutation({
        mutationFn: (budgetId) => api.delete(`/projects/${projectId}/budget/members/${budgetId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-budget', projectId] });
            toast.success('Member budget removed');
        },
    });

    const addExpenseMutation = useMutation({
        mutationFn: (data) => api.post(`/projects/${projectId}/budget/expenses`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-budget', projectId] });
            setShowExpenseForm(false);
            setExpenseForm({ category: 'Labor', description: '', amount: 0, expense_date: new Date().toISOString().split('T')[0] });
            toast.success('Expense added successfully');
        },
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: (expenseId) => api.delete(`/projects/${projectId}/budget/expenses/${expenseId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-budget', projectId] });
            toast.success('Expense removed');
        },
    });

    const formatCurrency = (amount, currency = 'IDR') => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const rateTypeLabels = {
        hourly: '/hour',
        daily: '/day',
        monthly: '/month',
        fixed: ' (fixed)',
    };

    if (!isOpen) return null;

    const summary = data?.summary || {};
    const memberBudgets = data?.member_budgets || [];
    const expenses = data?.expenses || [];
    const budgetUsedPercent = summary.total_budget > 0 
        ? ((summary.total_expenses / summary.total_budget) * 100).toFixed(1) 
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Project Budget</h2>
                            <p className="text-sm text-zinc-500">{data?.project?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                                        <Wallet className="w-4 h-4" />
                                        <span className="text-xs">Total Budget</span>
                                    </div>
                                    {editingBudget ? (
                                        <input
                                            type="number"
                                            value={budgetForm.total_budget}
                                            onChange={(e) => setBudgetForm({ ...budgetForm, total_budget: e.target.value })}
                                            className="w-full px-2 py-1 text-lg font-bold bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded"
                                        />
                                    ) : (
                                        <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                            {formatCurrency(summary.total_budget, data?.project?.currency)}
                                        </p>
                                    )}
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                        <Users className="w-4 h-4" />
                                        <span className="text-xs">Allocated</span>
                                    </div>
                                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                        {formatCurrency(summary.allocated_budget, data?.project?.currency)}
                                    </p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                                        <TrendingDown className="w-4 h-4" />
                                        <span className="text-xs">Expenses</span>
                                    </div>
                                    <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                                        {formatCurrency(summary.total_expenses, data?.project?.currency)}
                                    </p>
                                </div>
                                <div className={`rounded-xl p-4 ${summary.remaining_budget >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                    <div className={`flex items-center gap-2 mb-1 ${summary.remaining_budget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-xs">Remaining</span>
                                    </div>
                                    <p className={`text-xl font-bold ${summary.remaining_budget >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                        {formatCurrency(summary.remaining_budget, data?.project?.currency)}
                                    </p>
                                </div>
                            </div>

                            {/* Budget Progress Bar */}
                            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`h-full transition-all ${budgetUsedPercent > 100 ? 'bg-red-500' : budgetUsedPercent > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-center text-zinc-500">{budgetUsedPercent}% of budget used</p>

                            {/* Edit Budget Button */}
                            <div className="flex justify-end gap-2">
                                {editingBudget ? (
                                    <>
                                        <button onClick={() => setEditingBudget(false)} className="px-4 py-2 text-zinc-600 hover:text-zinc-900">Cancel</button>
                                        <button 
                                            onClick={() => updateBudgetMutation.mutate(budgetForm)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Save Budget
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => { setBudgetForm({ total_budget: summary.total_budget, currency: data?.project?.currency }); setEditingBudget(true); }}
                                        className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg"
                                    >
                                        Edit Total Budget
                                    </button>
                                )}
                            </div>

                            {/* Team Member Budgets */}
                            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800">
                                    <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Team Budget Allocation
                                    </h3>
                                    <button 
                                        onClick={() => setShowMemberForm(true)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                    >
                                        <Plus className="w-4 h-4" /> Add Member
                                    </button>
                                </div>
                                <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {memberBudgets.length === 0 ? (
                                        <p className="px-4 py-8 text-center text-zinc-500">No team budget allocations yet</p>
                                    ) : (
                                        memberBudgets.map((mb) => (
                                            <div key={mb.id} className="px-4 py-3 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                                                        {mb.user?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-zinc-900 dark:text-white">{mb.user?.name}</p>
                                                        <p className="text-sm text-zinc-500">{mb.role || 'Team Member'} • {formatCurrency(mb.rate)}{rateTypeLabels[mb.rate_type]}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold text-zinc-900 dark:text-white">{formatCurrency(mb.total_amount)}</p>
                                                    <button 
                                                        onClick={() => deleteMemberBudgetMutation.mutate(mb.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Expenses */}
                            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800">
                                    <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Expenses
                                    </h3>
                                    <button 
                                        onClick={() => setShowExpenseForm(true)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        <Plus className="w-4 h-4" /> Add Expense
                                    </button>
                                </div>
                                <div className="divide-y divide-zinc-200 dark:divide-zinc-700 max-h-60 overflow-y-auto">
                                    {expenses.length === 0 ? (
                                        <p className="px-4 py-8 text-center text-zinc-500">No expenses recorded</p>
                                    ) : (
                                        expenses.map((exp) => (
                                            <div key={exp.id} className="px-4 py-3 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-zinc-900 dark:text-white">{exp.description}</p>
                                                    <p className="text-sm text-zinc-500">{exp.category} • {new Date(exp.expense_date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(exp.amount)}</p>
                                                    <button 
                                                        onClick={() => deleteExpenseMutation.mutate(exp.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Add Member Budget Modal */}
                {showMemberForm && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Add Member Budget</h3>
                            <form onSubmit={(e) => { e.preventDefault(); addMemberBudgetMutation.mutate(memberForm); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Team Member</label>
                                    <select 
                                        value={memberForm.user_id}
                                        onChange={(e) => updateMemberForm('user_id', e.target.value)}
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                        required
                                    >
                                        <option value="">Select member...</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
                                    <input 
                                        type="text"
                                        value={memberForm.role}
                                        onChange={(e) => updateMemberForm('role', e.target.value)}
                                        placeholder="e.g., Developer, Designer"
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Rate Type</label>
                                        <select 
                                            value={memberForm.rate_type}
                                            onChange={(e) => updateMemberForm('rate_type', e.target.value)}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                        >
                                            <option value="hourly">Hourly</option>
                                            <option value="daily">Daily</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="fixed">Fixed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            Rate {memberForm.rate_type !== 'fixed' && `(per ${memberForm.rate_type.replace('ly', '')})`}
                                        </label>
                                        <input 
                                            type="number"
                                            value={memberForm.rate}
                                            onChange={(e) => updateMemberForm('rate', e.target.value)}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                {memberForm.rate_type !== 'fixed' && (
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            {memberForm.rate_type === 'hourly' ? 'Hours' : memberForm.rate_type === 'daily' ? 'Days' : 'Months'}
                                        </label>
                                        <input 
                                            type="number"
                                            value={memberForm.duration}
                                            onChange={(e) => updateMemberForm('duration', e.target.value)}
                                            min="0"
                                            step="0.5"
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Amount</label>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            value={memberForm.total_amount}
                                            onChange={(e) => updateMemberForm('total_amount', e.target.value)}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-100 dark:bg-zinc-600 text-zinc-900 dark:text-white font-semibold"
                                            required
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                                            {memberForm.rate_type !== 'fixed' && memberForm.rate > 0 && memberForm.duration > 0 && '(auto-calculated)'}
                                        </span>
                                    </div>
                                    {memberForm.rate_type !== 'fixed' && memberForm.rate > 0 && (
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {formatCurrency(memberForm.rate)} × {memberForm.duration} {memberForm.rate_type === 'hourly' ? 'hrs' : memberForm.rate_type === 'daily' ? 'days' : 'months'} = {formatCurrency(memberForm.total_amount)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button type="button" onClick={() => setShowMemberForm(false)} className="px-4 py-2 text-zinc-600 hover:text-zinc-900">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Add Member</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Expense Modal */}
                {showExpenseForm && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Add Expense</h3>
                            <form onSubmit={(e) => { e.preventDefault(); addExpenseMutation.mutate(expenseForm); }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                                    <select 
                                        value={expenseForm.category}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                    >
                                        <option value="Labor">Labor</option>
                                        <option value="Software">Software</option>
                                        <option value="Hardware">Hardware</option>
                                        <option value="Services">Services</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                                    <input 
                                        type="text"
                                        value={expenseForm.description}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Amount</label>
                                        <input 
                                            type="number"
                                            value={expenseForm.amount}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
                                        <input 
                                            type="date"
                                            value={expenseForm.expense_date}
                                            onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button type="button" onClick={() => setShowExpenseForm(false)} className="px-4 py-2 text-zinc-600 hover:text-zinc-900">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Add Expense</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectBudget;
