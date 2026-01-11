import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, UserPlus, X, Crown, Shield, User, Trash2, Search } from 'lucide-react';
import { useState } from 'react';

const fetchWorkspace = async (id) => {
    const { data } = await api.get(`/workspaces/${id}`);
    return data.data;
};

const fetchMembers = async (workspaceId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/members`);
    return data.data;
};

const searchUsers = async (workspaceId, query) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/members/search`, { params: { q: query } });
    return data.data;
};

const roleConfig = {
    owner: { label: 'Owner', icon: Crown, color: 'text-yellow-600 dark:text-yellow-500' },
    admin: { label: 'Admin', icon: Shield, color: 'text-blue-600 dark:text-blue-500' },
    member: { label: 'Member', icon: User, color: 'text-zinc-600 dark:text-zinc-400' },
};

const WorkspaceMembers = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const { data: workspace, isLoading: wsLoading } = useQuery({
        queryKey: ['workspace', id],
        queryFn: () => fetchWorkspace(id),
    });

    const { data: members, isLoading: membersLoading } = useQuery({
        queryKey: ['workspace-members', id],
        queryFn: () => fetchMembers(id),
    });

    const addMemberMutation = useMutation({
        mutationFn: (email) => api.post(`/workspaces/${id}/members`, { email }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members', id] });
            setShowAddModal(false);
            setSearchQuery('');
            setSearchResults([]);
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }) => api.put(`/workspaces/${id}/members/${userId}`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members', id] });
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId) => api.delete(`/workspaces/${id}/members/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workspace-members', id] });
        },
    });

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        try {
            const results = await searchUsers(id, query);
            setSearchResults(results);
        } catch (e) {
            setSearchResults([]);
        }
        setSearching(false);
    };

    const handleRemoveMember = (member) => {
        if (confirm(`Remove ${member.name} from this workspace?`)) {
            removeMemberMutation.mutate(member.id);
        }
    };

    if (wsLoading || membersLoading) {
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
                to={`/workspaces/${id}`}
                className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to {workspace?.name}
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Team Members</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage who has access to {workspace?.name}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            {/* Members List */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {members?.map((member) => {
                        const isOwner = workspace?.owner?.id === member.id;
                        const role = isOwner ? 'owner' : member.role;
                        const RoleIcon = roleConfig[role]?.icon || User;

                        return (
                            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-500">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-zinc-900 dark:text-white">
                                            {member.name}
                                        </p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {member.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Role Badge */}
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 ${roleConfig[role]?.color}`}>
                                        <RoleIcon className="w-3.5 h-3.5" />
                                        {roleConfig[role]?.label}
                                    </div>

                                    {/* Actions (not for owner) */}
                                    {!isOwner && (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={member.role}
                                                onChange={(e) => updateRoleMutation.mutate({ userId: member.id, role: e.target.value })}
                                                className="text-sm bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                            >
                                                <option value="member">Member</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => handleRemoveMember(member)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Add Team Member</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                Search by name or email
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="max-h-60 overflow-y-auto">
                            {searching ? (
                                <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                                    Searching...
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-2">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-500">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addMemberMutation.mutate(user.email)}
                                                disabled={addMemberMutation.isPending}
                                                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery.length >= 2 ? (
                                <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                                    No users found
                                </div>
                            ) : (
                                <div className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                                    Type at least 2 characters to search
                                </div>
                            )}
                        </div>

                        {addMemberMutation.error && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
                                {addMemberMutation.error.response?.data?.message || 'Failed to add member'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceMembers;
