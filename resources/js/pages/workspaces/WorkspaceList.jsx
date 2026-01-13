import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus, Building2, Users, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import toast from 'react-hot-toast';

const fetchWorkspaces = async () => {
    const { data } = await api.get('/workspaces');
    return data.data;
};

const WorkspaceList = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    const { data: workspaces, isLoading, error } = useQuery({
        queryKey: ['workspaces'],
        queryFn: fetchWorkspaces,
    });

    const createMutation = useMutation({
        mutationFn: (name) => api.post('/workspaces', { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspaces'] });
            setShowModal(false);
            setNewWorkspaceName('');
            toast.success('Workspace created successfully!');
        },
        onError: () => {
            toast.error('Failed to create workspace');
        },
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (newWorkspaceName.trim()) {
            createMutation.mutate(newWorkspaceName);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
                    Failed to load workspaces
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Workspaces</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage your team workspaces
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Workspace
                </button>
            </div>

            {/* Workspace Grid */}
            {workspaces?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((workspace) => (
                        <Link
                            key={workspace.id}
                            to={`/workspaces/${workspace.id}`}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:border-orange-300 dark:hover:border-orange-800 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                                    <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                                </div>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                {workspace.name}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                Owner: {workspace.owner?.name}
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" />
                                    Team
                                </span>
                                <span className="flex items-center gap-1">
                                    <FolderKanban className="w-3.5 h-3.5" />
                                    Projects
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <Building2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No workspaces yet</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
                        Create your first workspace to get started
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Workspace
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                            Create Workspace
                        </h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                    Workspace Name
                                </label>
                                <input
                                    type="text"
                                    value={newWorkspaceName}
                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                    placeholder="e.g. My Team"
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            {createMutation.error && (
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                                    {createMutation.error.response?.data?.message || 'Failed to create workspace'}
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

export default WorkspaceList;
