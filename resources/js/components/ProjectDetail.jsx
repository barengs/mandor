import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
    X, Building2, Users, Calendar, Wallet, Clock, CheckCircle2, 
    Circle, AlertCircle, TrendingUp, BarChart3, Target, User,
    Mail, Shield, CalendarDays, Layers, Printer
} from 'lucide-react';

const ProjectDetail = ({ projectId, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}`);
            return data.data;
        },
        enabled: isOpen && !!projectId,
    });

    const { data: tasks } = useQuery({
        queryKey: ['tasks', { project_id: projectId }],
        queryFn: async () => {
            const { data } = await api.get('/tasks', { params: { project_id: projectId } });
            return data.data;
        },
        enabled: isOpen && !!projectId,
    });

    const { data: members } = useQuery({
        queryKey: ['workspace-members', project?.workspace_id],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${project.workspace_id}/members`);
            return data.data;
        },
        enabled: isOpen && !!project?.workspace_id,
    });

    const { data: budget } = useQuery({
        queryKey: ['project-budget', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/budget`);
            return data;
        },
        enabled: isOpen && !!projectId,
    });

    const { data: sprints } = useQuery({
        queryKey: ['sprints', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/sprints`);
            return data.data;
        },
        enabled: isOpen && !!projectId && project?.has_sprints,
    });

    if (!isOpen) return null;

    const formatCurrency = (amount, currency = 'IDR') => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Calculate task statistics
    const taskStats = {
        total: tasks?.length || 0,
        completed: tasks?.filter(t => t.status?.name?.toLowerCase() === 'done' || t.status?.name?.toLowerCase() === 'complete').length || 0,
        inProgress: tasks?.filter(t => t.status?.name?.toLowerCase().includes('progress')).length || 0,
        todo: tasks?.filter(t => t.status?.name?.toLowerCase() === 'todo' || t.status?.name?.toLowerCase() === 'to do').length || 0,
    };
    const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

    // Calculate timeline info
    const allDueDates = tasks?.filter(t => t.due_date).map(t => new Date(t.due_date)) || [];
    const earliestDate = allDueDates.length > 0 ? new Date(Math.min(...allDueDates)) : null;
    const latestDate = allDueDates.length > 0 ? new Date(Math.max(...allDueDates)) : null;
    const overdueTasks = tasks?.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status?.name?.toLowerCase() !== 'done').length || 0;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Building2 },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'timeline', label: 'Timeline', icon: Calendar },
        { id: 'budget', label: 'Budget', icon: Wallet },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Building2 className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {project?.name || 'Project Details'}
                            </h2>
                            <p className="text-sm text-zinc-500">
                                {project?.key && <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs mr-2">{project.key}</span>}
                                {project?.workspace?.name}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => window.open(`/projects/${projectId}/report`, '_blank')}
                            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Print Project Report"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {projectLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <>
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                <Target className="w-4 h-4" />
                                                <span className="text-xs">Total Tasks</span>
                                            </div>
                                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{taskStats.total}</p>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-green-600 mb-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs">Completed</span>
                                            </div>
                                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{taskStats.completed}</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs">In Progress</span>
                                            </div>
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{taskStats.inProgress}</p>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-orange-600 mb-1">
                                                <Circle className="w-4 h-4" />
                                                <span className="text-xs">To Do</span>
                                            </div>
                                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{taskStats.todo}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                                Project Progress
                                            </h3>
                                            <span className="text-2xl font-bold text-orange-600">{completionRate}%</span>
                                        </div>
                                        <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full h-4 overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                                                style={{ width: `${completionRate}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-sm text-zinc-500 mt-2">
                                            {taskStats.completed} of {taskStats.total} tasks completed
                                        </p>
                                    </div>

                                    {/* Project Info */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5">
                                            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-orange-500" />
                                                Project Information
                                            </h3>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Project Key</dt>
                                                    <dd className="font-mono text-zinc-900 dark:text-white">{project?.key || '-'}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Workspace</dt>
                                                    <dd className="text-zinc-900 dark:text-white">{project?.workspace?.name || '-'}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Sprint Mode</dt>
                                                    <dd className="text-zinc-900 dark:text-white">
                                                        {project?.has_sprints ? (
                                                            <span className="text-green-600">Enabled</span>
                                                        ) : (
                                                            <span className="text-zinc-400">Disabled</span>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Created</dt>
                                                    <dd className="text-zinc-900 dark:text-white">{formatDate(project?.created_at)}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5">
                                            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                                <BarChart3 className="w-4 h-4 text-orange-500" />
                                                Quick Summary
                                            </h3>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Team Size</dt>
                                                    <dd className="text-zinc-900 dark:text-white">{members?.length || 0} members</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Budget</dt>
                                                    <dd className="text-zinc-900 dark:text-white">{formatCurrency(budget?.summary?.total_budget, project?.currency)}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Sprints</dt>
                                                    <dd className="text-zinc-900 dark:text-white">{sprints?.length || 0}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-zinc-500">Overdue Tasks</dt>
                                                    <dd className={overdueTasks > 0 ? 'text-red-600 font-semibold' : 'text-zinc-900 dark:text-white'}>
                                                        {overdueTasks}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Team Tab */}
                            {activeTab === 'team' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                                            Team Members ({members?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {members?.map((member) => {
                                            const memberBudget = budget?.member_budgets?.find(b => b.user_id === member.id);
                                            const memberTasks = tasks?.filter(t => t.assignees?.some(a => a.id === member.id)) || [];
                                            const completedTasks = memberTasks.filter(t => t.status?.name?.toLowerCase() === 'done').length;
                                            
                                            return (
                                                <div key={member.id} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                            {member.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-zinc-900 dark:text-white">{member.name}</h4>
                                                            <p className="text-sm text-zinc-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" />
                                                                {member.email}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                {member.pivot?.role && (
                                                                    <span className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded">
                                                                        <Shield className="w-3 h-3" />
                                                                        {member.pivot.role}
                                                                    </span>
                                                                )}
                                                                {memberBudget?.role && (
                                                                    <span className="text-xs text-zinc-500">{memberBudget.role}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-zinc-900 dark:text-white">{memberTasks.length}</p>
                                                            <p className="text-xs text-zinc-500">Tasks</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-green-600">{completedTasks}</p>
                                                            <p className="text-xs text-zinc-500">Done</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                                                {memberBudget ? formatCurrency(memberBudget.total_amount).replace('Rp', '').trim() : '-'}
                                                            </p>
                                                            <p className="text-xs text-zinc-500">Budget</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {(!members || members.length === 0) && (
                                        <div className="text-center py-12 text-zinc-500">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No team members found</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Timeline Tab */}
                            {activeTab === 'timeline' && (
                                <div className="space-y-6">
                                    {/* Timeline Overview */}
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                <CalendarDays className="w-4 h-4" />
                                                <span className="text-xs">Start Date</span>
                                            </div>
                                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                {earliestDate ? formatDate(earliestDate) : '-'}
                                            </p>
                                        </div>
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                <CalendarDays className="w-4 h-4" />
                                                <span className="text-xs">End Date</span>
                                            </div>
                                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                {latestDate ? formatDate(latestDate) : '-'}
                                            </p>
                                        </div>
                                        <div className={`rounded-xl p-4 ${overdueTasks > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                                            <div className={`flex items-center gap-2 mb-1 ${overdueTasks > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-xs">Overdue</span>
                                            </div>
                                            <p className={`text-lg font-semibold ${overdueTasks > 0 ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                                                {overdueTasks} tasks
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sprints Timeline */}
                                    {project?.has_sprints && sprints?.length > 0 && (
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5">
                                            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-orange-500" />
                                                Sprints
                                            </h3>
                                            <div className="space-y-3">
                                                {sprints.map((sprint) => {
                                                    const sprintTasks = tasks?.filter(t => t.sprint_id === sprint.id) || [];
                                                    const sprintCompleted = sprintTasks.filter(t => t.status?.name?.toLowerCase() === 'done').length;
                                                    const sprintProgress = sprintTasks.length > 0 ? Math.round((sprintCompleted / sprintTasks.length) * 100) : 0;
                                                    
                                                    return (
                                                        <div key={sprint.id} className="bg-white dark:bg-zinc-700 rounded-lg p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-medium text-zinc-900 dark:text-white">{sprint.name}</h4>
                                                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                                                        sprint.status === 'active' ? 'bg-green-100 text-green-700' :
                                                                        sprint.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-zinc-100 text-zinc-600'
                                                                    }`}>
                                                                        {sprint.status}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm text-zinc-500">{sprintProgress}%</span>
                                                            </div>
                                                            <div className="bg-zinc-200 dark:bg-zinc-600 rounded-full h-2 overflow-hidden mb-2">
                                                                <div 
                                                                    className="h-full bg-orange-500 transition-all"
                                                                    style={{ width: `${sprintProgress}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-zinc-500">
                                                                <span>{formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}</span>
                                                                <span>{sprintCompleted}/{sprintTasks.length} tasks</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Upcoming Deadlines */}
                                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5">
                                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            Upcoming Deadlines
                                        </h3>
                                        <div className="space-y-2">
                                            {tasks?.filter(t => t.due_date && new Date(t.due_date) >= new Date() && t.status?.name?.toLowerCase() !== 'done')
                                                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                                                .slice(0, 5)
                                                .map((task) => (
                                                    <div key={task.id} className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-0">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-2 h-2 rounded-full ${
                                                                task.priority === 'high' ? 'bg-red-500' :
                                                                task.priority === 'medium' ? 'bg-orange-500' :
                                                                'bg-zinc-400'
                                                            }`}></span>
                                                            <span className="text-zinc-900 dark:text-white">{task.title}</span>
                                                        </div>
                                                        <span className="text-sm text-zinc-500">{formatDate(task.due_date)}</span>
                                                    </div>
                                                ))}
                                            {tasks?.filter(t => t.due_date && new Date(t.due_date) >= new Date() && t.status?.name?.toLowerCase() !== 'done').length === 0 && (
                                                <p className="text-zinc-500 text-center py-4">No upcoming deadlines</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Budget Tab */}
                            {activeTab === 'budget' && (
                                <div className="space-y-6">
                                    {/* Budget Summary */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                                <Wallet className="w-4 h-4" />
                                                <span className="text-xs">Total Budget</span>
                                            </div>
                                            <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                                {formatCurrency(budget?.summary?.total_budget, project?.currency)}
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Users className="w-4 h-4" />
                                                <span className="text-xs">Allocated</span>
                                            </div>
                                            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                                {formatCurrency(budget?.summary?.allocated_budget, project?.currency)}
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-orange-600 mb-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-xs">Expenses</span>
                                            </div>
                                            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                                                {formatCurrency(budget?.summary?.total_expenses, project?.currency)}
                                            </p>
                                        </div>
                                        <div className={`rounded-xl p-4 ${(budget?.summary?.remaining_budget || 0) >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                            <div className={`flex items-center gap-2 mb-1 ${(budget?.summary?.remaining_budget || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs">Remaining</span>
                                            </div>
                                            <p className={`text-xl font-bold ${(budget?.summary?.remaining_budget || 0) >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                                {formatCurrency(budget?.summary?.remaining_budget, project?.currency)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Budget Progress */}
                                    {budget?.summary?.total_budget > 0 && (
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-zinc-900 dark:text-white">Budget Usage</h3>
                                                <span className="text-lg font-bold text-orange-600">
                                                    {Math.round((budget?.summary?.total_expenses / budget?.summary?.total_budget) * 100)}%
                                                </span>
                                            </div>
                                            <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full h-4 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all ${
                                                        (budget?.summary?.total_expenses / budget?.summary?.total_budget) > 1 ? 'bg-red-500' :
                                                        (budget?.summary?.total_expenses / budget?.summary?.total_budget) > 0.8 ? 'bg-orange-500' :
                                                        'bg-green-500'
                                                    }`}
                                                    style={{ width: `${Math.min((budget?.summary?.total_expenses / budget?.summary?.total_budget) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Team Budget Allocation */}
                                    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5">
                                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-orange-500" />
                                            Team Budget Allocation
                                        </h3>
                                        <div className="space-y-3">
                                            {budget?.member_budgets?.map((mb) => (
                                                <div key={mb.id} className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 text-sm font-semibold">
                                                            {mb.user?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-zinc-900 dark:text-white">{mb.user?.name}</p>
                                                            <p className="text-xs text-zinc-500">{mb.role || 'Team Member'}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-semibold text-zinc-900 dark:text-white">{formatCurrency(mb.total_amount)}</p>
                                                </div>
                                            ))}
                                            {(!budget?.member_budgets || budget.member_budgets.length === 0) && (
                                                <p className="text-zinc-500 text-center py-4">No budget allocations</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
