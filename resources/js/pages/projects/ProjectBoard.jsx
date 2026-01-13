import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, Calendar, User, Flag, MoreHorizontal, X, List, LayoutGrid, GanttChartSquare, Layers, Settings, MessageSquare, Wallet, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import GanttChart from '@/components/GanttChart';
import SprintBoard from '@/components/SprintBoard';
import TaskDetail from '@/components/TaskDetail';
import ProjectChat from '@/components/ProjectChat';
import ProjectBudget from '@/components/ProjectBudget';
import ProjectDetail from '@/components/ProjectDetail';
import ProjectStatusManager from '@/components/ProjectStatusManager';

const fetchProject = async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data.data;
};

const fetchStatuses = async (projectId) => {
    const { data } = await api.get('/project-statuses', { params: { project_id: projectId } });
    return data.data;
};

const fetchTasks = async (projectId) => {
    const { data } = await api.get('/tasks', { params: { project_id: projectId } });
    return data.data;
};

const priorityConfig = {
    Low: { color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400', icon: '↓' },
    Medium: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', icon: '→' },
    High: { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', icon: '↑' },
    Urgent: { color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', icon: '⚡' },
};

const TaskModal = ({ isOpen, onClose, projectId, workspaceId, statuses, task = null, onSuccess, defaultStatusId }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status_id: '',
        priority: 'Medium',
        start_date: '',
        due_date: '',
        assignee_ids: [],
    });

    // Fetch workspace members for assignee selection
    const { data: members } = useQuery({
        queryKey: ['workspace-members', workspaceId],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${workspaceId}/members`);
            return data.data;
        },
        enabled: !!workspaceId && isOpen,
    });

    // Update form when modal opens or task changes
    useEffect(() => {
        if (!isOpen) return;
        
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status_id: String(task.status?.id || ''),
                priority: task.priority || 'Medium',
                start_date: task.start_date ? task.start_date.split('T')[0] : '',
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                assignee_ids: task.assignees?.map(a => a.id) || [],
            });
        } else {
            setFormData({
                title: '',
                description: '',
                status_id: String(defaultStatusId || statuses?.[0]?.id || ''),
                priority: 'Medium',
                start_date: '',
                due_date: '',
                assignee_ids: [],
            });
        }
    }, [isOpen, task, defaultStatusId, statuses]);

    const mutation = useMutation({
        mutationFn: (data) => task 
            ? api.put(`/tasks/${task.id}`, data)
            : api.post('/tasks', { ...data, project_id: projectId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            onSuccess?.();
            onClose();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {task ? 'Edit Task' : 'Create Task'}
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Task title"
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Task description (optional)"
                            rows={3}
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Status</label>
                            <select
                                value={formData.status_id}
                                onChange={(e) => setFormData({ ...formData, status_id: e.target.value })}
                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                            >
                                {statuses?.map((status) => (
                                    <option key={status.id} value={String(status.id)}>{status.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Due Date</label>
                            <input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Assignees</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg min-h-[42px]">
                            {members?.map((member) => {
                                const isSelected = formData.assignee_ids.includes(member.id);
                                return (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setFormData({ ...formData, assignee_ids: formData.assignee_ids.filter(id => id !== member.id) });
                                            } else {
                                                setFormData({ ...formData, assignee_ids: [...formData.assignee_ids, member.id] });
                                            }
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                            isSelected 
                                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' 
                                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                                        }`}
                                    >
                                        <span className="w-4 h-4 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-[10px]">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </span>
                                        {member.name}
                                    </button>
                                );
                            })}
                            {(!members || members.length === 0) && (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">No team members available</span>
                            )}
                        </div>
                    </div>
                    {mutation.error && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {mutation.error.response?.data?.message || 'Failed to save task'}
                        </p>
                    )}
                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Saving...' : (task ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProjectBoard = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null); // For viewing task details
    const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
    const [defaultStatusId, setDefaultStatusId] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [chatTask, setChatTask] = useState(null);
    const [showBudget, setShowBudget] = useState(false);
    const [showProjectDetail, setShowProjectDetail] = useState(false);
    const [showStatusManager, setShowStatusManager] = useState(false);

    const { data: project, isLoading: projLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: () => fetchProject(id),
    });

    const { data: statuses, isLoading: statusLoading } = useQuery({
        queryKey: ['statuses', id],
        queryFn: () => fetchStatuses(id),
    });

    const { data: tasks, isLoading: taskLoading } = useQuery({
        queryKey: ['tasks', id],
        queryFn: () => fetchTasks(id),
    });

    // Fetch workspace members for chat mentions
    const { data: members } = useQuery({
        queryKey: ['workspace-members', project?.workspace_id],
        queryFn: async () => {
            const { data } = await api.get(`/workspaces/${project?.workspace_id}/members`);
            return data.data;
        },
        enabled: !!project?.workspace_id,
    });

    const deleteMutation = useMutation({
        mutationFn: (taskId) => api.delete(`/tasks/${taskId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', id] });
            setSelectedTask(null);
        },
    });

    const handleDeleteTask = (task) => {
        if (confirm('Are you sure you want to delete this task?')) {
            deleteMutation.mutate(task.id);
        }
    };

    if (projLoading || statusLoading || taskLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
                </div>
            </div>
        );
    }

    const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="p-8">
            {/* Back Link */}
            <Link
                to={`/workspaces/${project?.workspace_id}`}
                className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {project?.name}
                    </h1>
                    <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono rounded">
                        {project?.key}
                    </span>
                    <button
                        onClick={() => setShowProjectDetail(true)}
                        className="p-1.5 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Project Details"
                    >
                        <Info className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowStatusManager(true)}
                        className="p-1.5 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Manage Statuses"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    {/* Sprint Toggle */}
                    <button
                        onClick={() => {
                            api.put(`/projects/${id}`, { has_sprints: !project?.has_sprints })
                                .then(() => queryClient.invalidateQueries(['project', id]));
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border transition-colors ${
                            project?.has_sprints
                                ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                : 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 hover:border-green-300'
                        }`}
                        title={project?.has_sprints ? 'Sprints enabled' : 'Click to enable sprints'}
                    >
                        <Layers className="w-3 h-3" />
                        {project?.has_sprints ? 'Sprints On' : 'Enable Sprints'}
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <List className="w-4 h-4" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'kanban'
                                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Board
                        </button>
                        <button
                            onClick={() => setViewMode('gantt')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'gantt'
                                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                            }`}
                        >
                            <GanttChartSquare className="w-4 h-4" />
                            Gantt
                        </button>
                        {project?.has_sprints && (
                            <button
                                onClick={() => setViewMode('sprint')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    viewMode === 'sprint'
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                                }`}
                            >
                                <Layers className="w-4 h-4" />
                                Sprints
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowChat(true)}
                        className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium rounded-lg transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                    </button>
                    <button
                        onClick={() => setShowBudget(true)}
                        className="flex items-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium rounded-lg transition-colors"
                    >
                        <Wallet className="w-4 h-4" />
                        Budget
                    </button>
                    <button
                        onClick={() => { setEditingTask(null); setDefaultStatusId(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Task
                    </button>
                </div>
            </div>

            {/* Views */}
            {viewMode === 'kanban' && (
                <KanbanBoard
                    statuses={statuses || []}
                    tasks={tasks || []}
                    projectId={id}
                    onTaskClick={(task) => setSelectedTask(task)}
                    onChatClick={(task) => { setChatTask(task); setShowChat(true); }}
                    onAddTask={(statusId) => { setEditingTask(null); setDefaultStatusId(statusId); setShowModal(true); }}
                />
            )}

            {viewMode === 'gantt' && (
                <GanttChart
                    statuses={statuses || []}
                    tasks={tasks || []}
                    onTaskClick={(task) => setSelectedTask(task)}
                />
            )}

            {viewMode === 'sprint' && project?.has_sprints && (
                <SprintBoard
                    project={project}
                    onTaskClick={(task) => setSelectedTask(task)}
                />
            )}

            {viewMode === 'list' && (
                /* Task Table */
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Task</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-32">Status</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-28">Priority</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-28">Due Date</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks?.length > 0 ? (
                            tasks.map((task) => (
                                <tr
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">{task.title}</p>
                                        {task.description && (
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-md">
                                                {task.description}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                            style={{ backgroundColor: task.status?.color + '20', color: task.status?.color }}
                                        >
                                            {task.status?.name}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${priorityConfig[task.priority]?.color}`}>
                                            {priorityConfig[task.priority]?.icon} {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {task.due_date && (
                                            <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(task.due_date)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center">
                                    <p className="text-zinc-500 dark:text-zinc-400">No tasks yet</p>
                                    <button
                                        onClick={() => { setEditingTask(null); setShowModal(true); }}
                                        className="mt-2 text-orange-600 dark:text-orange-500 hover:underline text-sm"
                                    >
                                        Create your first task
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            )}

            {/* Task Modal */}
            <TaskModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingTask(null); setDefaultStatusId(null); }}
                projectId={id}
                workspaceId={project?.workspace_id}
                statuses={statuses}
                task={editingTask}
                defaultStatusId={defaultStatusId}
            />

            {/* Task Detail Panel */}
            <TaskDetail
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                onEdit={(task) => {
                    setSelectedTask(null);
                    setEditingTask(task);
                    setShowModal(true);
                }}
                onDelete={handleDeleteTask}
                statuses={statuses}
            />

            {/* Project Chat */}
            <ProjectChat
                projectId={id}
                isOpen={showChat}
                onClose={() => { setShowChat(false); setChatTask(null); }}
                tasks={tasks || []}
                members={members || []}
                initialTask={chatTask}
            />

            {/* Project Budget */}
            <ProjectBudget
                projectId={id}
                isOpen={showBudget}
                onClose={() => setShowBudget(false)}
                members={members || []}
            />

            <ProjectDetail
                projectId={id}
                isOpen={showProjectDetail}
                onClose={() => setShowProjectDetail(false)}
            />

            <ProjectStatusManager
                isOpen={showStatusManager}
                onClose={() => setShowStatusManager(false)}
                projectId={id}
                statuses={statuses || []}
            />
        </div>
    );
};

export default ProjectBoard;
