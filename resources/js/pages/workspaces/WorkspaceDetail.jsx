import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, Link } from 'react-router-dom';
import { Plus, FolderKanban, ArrowLeft, MoreHorizontal, Users } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const fetchWorkspace = async (id) => {
    const { data } = await api.get(`/workspaces/${id}`);
    return data.data;
};

const fetchProjects = async (workspaceId) => {
    const { data } = await api.get('/projects', { params: { workspace_id: workspaceId } });
    return data.data;
};

const WorkspaceDetail = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectKey, setProjectKey] = useState('');

    const { data: workspace, isLoading: wsLoading } = useQuery({
        queryKey: ['workspace', id],
        queryFn: () => fetchWorkspace(id),
    });

    const { data: projects, isLoading: projLoading } = useQuery({
        queryKey: ['projects', id],
        queryFn: () => fetchProjects(id),
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/projects', { ...data, workspace_id: id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', id] });
            setShowModal(false);
            setProjectName('');
            setProjectKey('');
            toast.success('Project created successfully!');
        },
        onError: () => {
            toast.error('Failed to create project');
        },
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (projectName.trim() && projectKey.trim()) {
            createMutation.mutate({ name: projectName, key: projectKey.toUpperCase() });
        }
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setProjectName(name);
        // Auto-generate key from name
        if (!projectKey || projectKey === generateKey(projectName)) {
            setProjectKey(generateKey(name));
        }
    };

    const generateKey = (name) => {
        return name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 4);
    };

    if (wsLoading || projLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div>
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Back Link */}
            <Link
                to="/workspaces"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Workspaces
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {workspace?.name}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Projects in this workspace
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to={`/workspaces/${id}/members`}
                        className="flex items-center gap-2 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium rounded-lg transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        Team
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {projects?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:border-orange-300 dark:hover:border-orange-800 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                </div>
                                <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono rounded">
                                    {project.key}
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                {project.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <FolderKanban className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No projects yet</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
                        Create your first project to start managing tasks
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Project
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                            Create Project
                        </h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={handleNameChange}
                                    placeholder="e.g. Website Redesign"
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Project Key
                                </label>
                                <input
                                    type="text"
                                    value={projectKey}
                                    onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
                                    placeholder="e.g. WEB"
                                    maxLength={10}
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white font-mono uppercase"
                                />
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Used as prefix for task IDs (e.g. WEB-1, WEB-2)
                                </p>
                            </div>
                            {createMutation.error && (
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                    {createMutation.error.response?.data?.message || 'Failed to create project'}
                                </p>
                            )}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isPending ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceDetail;
