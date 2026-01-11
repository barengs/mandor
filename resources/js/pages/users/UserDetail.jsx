import { useState, Fragment, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    ShieldCheckIcon,
    EnvelopeIcon,
    CalendarIcon,
    XMarkIcon,
    CheckIcon,
    BuildingOfficeIcon,
    FolderIcon,
} from '@heroicons/react/24/outline';
import api from '../../lib/axios';

const roleColors = {
    'Super Admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Project Manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Developer': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Viewer': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Fetch user details
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const { data } = await api.get(`/users/${id}`);
            return data.data;
        },
    });

    // Fetch roles for edit modal
    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const { data } = await api.get('/roles');
            return data.data;
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: () => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            navigate('/users');
        },
    });

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${user?.name}"? This action cannot be undone.`)) {
            deleteMutation.mutate();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load user</p>
                    <button
                        onClick={() => navigate('/users')}
                        className="text-indigo-600 hover:text-indigo-700"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    to="/users"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Users
                </Link>

                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
                    
                    {/* Profile Info */}
                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                            {/* Avatar */}
                            <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-800 p-1 shadow-lg">
                                <div className="h-full w-full rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Name & Actions */}
                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {user?.name}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                                        <EnvelopeIcon className="h-4 w-4" />
                                        {user?.email}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Roles Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheckIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Roles
                            </h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {user?.roles?.length > 0 ? (
                                user.roles.map((role) => (
                                    <span
                                        key={role}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                            roleColors[role] || 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {role}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">No roles assigned</span>
                            )}
                        </div>
                    </div>

                    {/* Permissions Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Permissions
                            </h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                            {user?.permissions?.length > 0 ? (
                                user.permissions.map((perm) => (
                                    <span
                                        key={perm}
                                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                    >
                                        {perm}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400">No permissions</span>
                            )}
                        </div>
                    </div>

                    {/* Account Info Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Account Information
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                                <p className="text-gray-900 dark:text-white font-mono">{user?.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                                <p className="text-gray-900 dark:text-white">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    }) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {user && (
                <EditUserModal
                    isOpen={isEditOpen}
                    onClose={() => setIsEditOpen(false)}
                    user={user}
                    roles={rolesData || []}
                />
            )}
        </div>
    );
}

function EditUserModal({ isOpen, onClose, user, roles }) {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: Array.isArray(user?.roles) ? [...user.roles] : [],
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                roles: Array.isArray(user.roles) ? [...user.roles] : [],
            });
        }
    }, [user]);

    const updateMutation = useMutation({
        mutationFn: (data) => api.put(`/users/${user?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['user', String(user?.id)]);
            queryClient.invalidateQueries(['users']);
            onClose();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            email: formData.email,
            roles: formData.roles,
        };
        if (formData.password) {
            payload.password = formData.password;
        }
        updateMutation.mutate(payload);
    };

    const toggleRole = (roleName) => {
        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.includes(roleName)
                ? prev.roles.filter((r) => r !== roleName)
                : [...prev.roles, roleName],
        }));
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Edit User
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Password (leave blank to keep current)
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Roles
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((role) => (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => toggleRole(role.name)}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                        formData.roles.includes(role.name)
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    {formData.roles.includes(role.name) && (
                                                        <CheckIcon className="h-4 w-4" />
                                                    )}
                                                    {role.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={updateMutation.isPending}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {updateMutation.isPending ? 'Saving...' : 'Update'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
