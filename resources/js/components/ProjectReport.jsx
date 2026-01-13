import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { 
    Printer, ArrowLeft, Building2, Users, Calendar, 
    Wallet, TrendingUp, Circle, CheckCircle2, Clock
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ProjectReportDocument from './reports/ProjectReportDocument';

const ProjectReport = () => {
    const { id: projectId } = useParams();
    const navigate = useNavigate();

    // Fetch Project Data
    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}`);
            return data.data;
        },
    });

    // Keep existing fetch logic...
    // ...

    // Fetch Tasks
    const { data: tasks } = useQuery({
        queryKey: ['tasks', { project_id: projectId }],
        queryFn: async () => {
            const { data } = await api.get('/tasks', { params: { project_id: projectId } });
            return data.data;
        },
    });

    // Fetch Members
    const { data: members } = useQuery({
        queryKey: ['workspace-members', project?.workspace_id],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${project.workspace_id}/members`);
            return data.data;
        },
        enabled: !!project?.workspace_id,
    });

    // Fetch Budget
    const { data: budget } = useQuery({
        queryKey: ['project-budget', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/budget`);
            return data;
        },
    });

    // Fetch Sprints
    const { data: sprints } = useQuery({
        queryKey: ['sprints', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/sprints`);
            return data.data;
        },
        enabled: !!project?.has_sprints,
    });

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
            month: 'long',
            year: 'numeric',
        });
    };

    if (projectLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Calculations
    const taskStats = {
        total: tasks?.length || 0,
        completed: tasks?.filter(t => t.status?.name?.toLowerCase() === 'done' || t.status?.name?.toLowerCase() === 'complete').length || 0,
        inProgress: tasks?.filter(t => t.status?.name?.toLowerCase().includes('progress')).length || 0,
        todo: tasks?.filter(t => t.status?.name?.toLowerCase() === 'todo' || t.status?.name?.toLowerCase() === 'to do').length || 0,
    };
    const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;
    
    return (
        <div className="min-h-screen bg-white text-zinc-900 p-8 max-w-[210mm] mx-auto">
            {/* Print Controls - Hidden when printing */}
            <div className="print:hidden flex items-center justify-between mb-8 sticky top-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-zinc-200 shadow-sm z-50">
                <button 
                    onClick={() => window.close()}
                    className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Close Report
                </button>
                
                <PDFDownloadLink
                    document={
                        <ProjectReportDocument 
                            project={project}
                            tasks={tasks}
                            members={members}
                            budget={budget}
                            sprints={sprints}
                        />
                    }
                    fileName={`project-report-${project?.key || 'mandor'}.pdf`}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    {({ blob, url, loading, error }) => 
                        loading ? 'Generating PDF...' : (
                            <>
                                <Printer className="w-4 h-4" />
                                Download PDF
                            </>
                        )
                    }
                </PDFDownloadLink>
            </div>

            {/* Content Wrapper (Preview) */}
            <div id="report-content">

            {/* Report Header */}
            <div className="border-b-2 border-zinc-900 pb-6 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{project?.name}</h1>
                        <p className="text-zinc-600 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {project?.workspace?.name}
                            <span className="mx-2">•</span>
                            <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded text-sm">{project?.key}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-500">Report Generated</p>
                        <p className="font-medium">{formatDate(new Date())}</p>
                    </div>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h2 className="text-xl font-bold border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-zinc-600" />
                        Project Progress
                    </h2>
                    <div className="bg-zinc-50 rounded-lg p-6 border border-zinc-100">
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-5xl font-bold text-zinc-900">{completionRate}%</span>
                            <span className="text-zinc-500 mb-1">completed</span>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-3 mb-4">
                            <div 
                                className="bg-zinc-900 h-3 rounded-full" 
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-xl font-bold text-zinc-900">{taskStats.completed}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide">Done</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-zinc-900">{taskStats.inProgress}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide">In Progress</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-zinc-900">{taskStats.todo}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wide">To Do</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-zinc-600" />
                        Budget Overview
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                            <span className="text-zinc-600">Total Budget</span>
                            <span className="text-lg font-bold">
                                {formatCurrency(budget?.summary?.total_budget, project?.currency)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                            <span className="text-zinc-600">Total Used</span>
                            <span className="text-lg font-bold text-zinc-900">
                                {formatCurrency(budget?.summary?.total_expenses, project?.currency)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                            <span className="text-zinc-600">Remaining</span>
                            <span className={`text-lg font-bold ${
                                (budget?.summary?.remaining_budget || 0) < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                                {formatCurrency(budget?.summary?.remaining_budget, project?.currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sprints & Timeline */}
            {project?.has_sprints && (sprints?.length > 0) && (
                <div className="mb-12 break-inside-avoid">
                    <h2 className="text-xl font-bold border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-zinc-600" />
                        Sprints Status
                    </h2>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left bg-zinc-50 border-b border-zinc-200">
                                <th className="p-3 font-semibold text-zinc-600">Sprint Name</th>
                                <th className="p-3 font-semibold text-zinc-600">Period</th>
                                <th className="p-3 font-semibold text-zinc-600">Status</th>
                                <th className="p-3 font-semibold text-zinc-600 text-right">Completion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {sprints.map(sprint => {
                                const sprintTasks = tasks?.filter(t => t.sprint_id === sprint.id) || [];
                                const total = sprintTasks.length;
                                const completed = sprintTasks.filter(t => t.status?.name?.toLowerCase() === 'done').length;
                                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                                return (
                                    <tr key={sprint.id}>
                                        <td className="p-3 font-medium">{sprint.name}</td>
                                        <td className="p-3 text-zinc-600">
                                            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${
                                                sprint.status === 'active' ? 'bg-green-50 border-green-200 text-green-700' :
                                                sprint.status === 'completed' ? 'bg-zinc-100 border-zinc-200 text-zinc-700' :
                                                'bg-white border-zinc-200 text-zinc-500'
                                            }`}>
                                                {sprint.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <span className="font-mono">{percentage}%</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Task List */}
            <div className="mb-12 break-inside-avoid">
                <h2 className="text-xl font-bold border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-zinc-600" />
                    All Tasks
                </h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left bg-zinc-50 border-b border-zinc-200">
                            <th className="p-3 font-semibold text-zinc-600">Task Title</th>
                            <th className="p-3 font-semibold text-zinc-600">Status</th>
                            <th className="p-3 font-semibold text-zinc-600">Priority</th>
                            <th className="p-3 font-semibold text-zinc-600">Assignee</th>
                            <th className="p-3 font-semibold text-zinc-600">Due Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {tasks?.sort((a, b) => {
                            // Sort by Status (TODO logic first) then Due Date
                            const statusOrder = { 'todo': 1, 'in progress': 2, 'done': 3 };
                            const statusA = statusOrder[a.status?.name?.toLowerCase()] || 4;
                            const statusB = statusOrder[b.status?.name?.toLowerCase()] || 4;
                            if (statusA !== statusB) return statusA - statusB;
                            return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
                        }).map(task => (
                            <tr key={task.id} className="break-inside-avoid">
                                <td className="p-3 font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            task.priority === 'high' ? 'bg-red-500' :
                                            task.priority === 'medium' ? 'bg-orange-500' :
                                            'bg-zinc-300'
                                        }`}></div>
                                        {task.title}
                                    </div>
                                    <div className="text-xs text-zinc-500 pl-4">{task.key}</div>
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs border ${
                                        task.status?.name?.toLowerCase() === 'done' ? 'bg-green-50 border-green-200 text-green-700' :
                                        task.status?.name?.toLowerCase().includes('progress') ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                        'bg-zinc-100 border-zinc-200 text-zinc-700'
                                    }`}>
                                        {task.status?.name}
                                    </span>
                                </td>
                                <td className="p-3 capitalize text-zinc-600">{task.priority}</td>
                                <td className="p-3">
                                    <div className="flex -space-x-2">
                                        {task.assignees?.map((assignee, i) => (
                                            <div 
                                                key={assignee.id} 
                                                className="w-6 h-6 rounded-full bg-zinc-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-zinc-600"
                                                title={assignee.name}
                                                style={{ zIndex: task.assignees.length - i }}
                                            >
                                                {assignee.name.charAt(0)}
                                            </div>
                                        ))}
                                        {(!task.assignees || task.assignees.length === 0) && (
                                            <span className="text-zinc-400 italic text-xs">Unassigned</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-zinc-600">
                                    {formatDate(task.due_date)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Team Members */}
            <div className="mb-12 break-inside-avoid">
                <h2 className="text-xl font-bold border-b border-zinc-200 pb-2 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-zinc-600" />
                    Team & Resource Allocation
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {members?.map(member => {
                        const memberBudget = budget?.member_budgets?.find(b => b.user_id === member.id);
                        const memberTasks = tasks?.filter(t => t.assignees?.some(a => a.id === member.id)) || [];
                        const completed = memberTasks.filter(t => t.status?.name?.toLowerCase() === 'done').length;

                        return (
                            <div key={member.id} className="border border-zinc-200 rounded-lg p-4 break-inside-avoid">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-bold">{member.name}</div>
                                        <div className="text-sm text-zinc-500">{member.email}</div>
                                        <div className="text-xs text-zinc-400 mt-1">{member.pivot?.role}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono font-bold text-zinc-700">
                                            {memberBudget ? formatCurrency(memberBudget.total_amount) : '-'}
                                        </div>
                                        <div className="text-xs text-zinc-500">Allocated</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm bg-zinc-50 p-2 rounded">
                                    <div className="flex-1">
                                        <span className="text-zinc-500">Tasks:</span> 
                                        <span className="font-medium ml-1">{memberTasks.length}</span>
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-zinc-500">Done:</span>
                                        <span className="font-medium ml-1 text-green-600">{completed}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Report Footer */}
            <div className="mt-12 pt-8 border-t-2 border-zinc-900 text-center text-sm text-zinc-500">
                <p>Mandor Project Management System</p>
                <p className="mt-1">Generated by {project?.workspace?.name} Workspace</p>
            </div>
            </div>
        </div>
    );
};

export default ProjectReport;
