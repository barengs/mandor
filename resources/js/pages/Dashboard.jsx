import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Calendar, AlertTriangle, Clock, ArrowRight, FolderKanban, CheckSquare, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';

const fetchDashboard = async () => {
    const { data } = await api.get('/dashboard');
    return data;
};

const priorityColors = {
    Low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    Medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    High: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    Urgent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const TaskCard = ({ task }) => (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-orange-300 dark:hover:border-orange-800 transition-colors">
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                {task.title}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {task.project?.name || 'No Project'}
            </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
        </span>
    </div>
);

const Dashboard = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
    });

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-64"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                        <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    Failed to load dashboard data
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {data.greeting}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Here's what's happening with your tasks today.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {data.stats.tasks_due_today}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Due Today</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {data.stats.tasks_overdue}
                            </p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Overdue</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Tasks */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                            Today's Tasks
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {data.todays_tasks?.length > 0 ? (
                            data.todays_tasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                                No tasks due today. Great job!
                            </p>
                        )}
                    </div>
                </div>

                {/* Overdue Tasks */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Overdue Tasks
                        </h2>
                    </div>
                    <div className="space-y-3">
                        {data.overdue_tasks?.length > 0 ? (
                            data.overdue_tasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                                No overdue tasks. Keep it up!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Workspaces */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Recent Workspaces
                    </h2>
                    <Link
                        to="/workspaces"
                        className="text-sm text-orange-600 dark:text-orange-500 hover:underline flex items-center gap-1"
                    >
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.recent_workspaces?.length > 0 ? (
                        data.recent_workspaces.map((workspace) => (
                            <Link
                                key={workspace.id}
                                to={`/workspaces/${workspace.id}`}
                                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 hover:border-orange-300 dark:hover:border-orange-800 transition-colors"
                            >
                                <h3 className="font-medium text-zinc-900 dark:text-white">
                                    {workspace.name}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Owner: {workspace.owner?.name}
                                </p>
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                                        <FolderKanban className="w-4 h-4" />
                                        <span>{workspace.projects_count} Projects</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                                        <CheckSquare className="w-4 h-4" />
                                        <span>{workspace.tasks_count} Tasks</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400">
                                        <ListTodo className="w-4 h-4" />
                                        <span>{workspace.todo_count} To Do</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-8 text-zinc-500 dark:text-zinc-400">
                            <p>No workspaces yet.</p>
                            <Link
                                to="/workspaces"
                                className="text-orange-600 dark:text-orange-500 hover:underline mt-2 inline-block"
                            >
                                Create your first workspace
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
