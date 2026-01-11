import { useState, Fragment, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
    UserPlusIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EllipsisVerticalIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import api from '../../lib/axios';

const roleColors = {
    'Super Admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'Admin': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'Project Manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'Developer': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Viewer': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export default function UserManagement() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editModal, setEditModal] = useState({ isOpen: false, user: null });

    // Fetch users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users', search, roleFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (roleFilter) params.append('role', roleFilter);
            const { data } = await api.get(`/users?${params.toString()}`);
            return data;
        },
    });

    // Fetch roles
    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const { data } = await api.get('/roles');
            return data.data;
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: (userId) => api.delete(`/users/${userId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
        },
    });

    const handleDelete = (user) => {
        if (confirm(`Are you sure you want to delete "${user.name}"?`)) {
            deleteMutation.mutate(user.id);
        }
    };

    const openEdit = (user) => {
        setEditModal({ isOpen: true, user });
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, user: null });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage users and their roles
                    </p>
                </div>

                {/* Toolbar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex flex-1 gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Role Filter */}
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Roles</option>
                            {rolesData?.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Create Button */}
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Add User
                    </button>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Roles
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : usersData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                usersData?.data?.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                                        {user.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map((role) => (
                                                    <span
                                                        key={role}
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            roleColors[role] || 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                                {(!user.roles || user.roles.length === 0) && (
                                                    <span className="text-sm text-gray-400">No roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Menu as="div" className="relative inline-block text-left">
                                                <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                                </Menu.Button>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-100"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <div className="py-1">
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => navigate(`/users/${user.id}`)}
                                                                        className={`${
                                                                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                                                    >
                                                                        <EyeIcon className="h-4 w-4" />
                                                                        View Details
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => openEdit(user)}
                                                                        className={`${
                                                                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                                                    >
                                                                        <PencilIcon className="h-4 w-4" />
                                                                        Edit User
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => handleDelete(user)}
                                                                        className={`${
                                                                            active ? 'bg-red-50 dark:bg-red-900/20' : ''
                                                                        } flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                                                    >
                                                                        <TrashIcon className="h-4 w-4" />
                                                                        Delete User
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                        </div>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {usersData?.meta && usersData.meta.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {usersData.meta.per_page * (usersData.meta.current_page - 1) + 1} to{' '}
                                {Math.min(usersData.meta.per_page * usersData.meta.current_page, usersData.meta.total)} of{' '}
                                {usersData.meta.total} users
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            <UserModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                roles={rolesData || []}
            />

            {/* Edit User Modal - use key to force remount when user changes */}
            {editModal.user && (
                <UserModal
                    key={editModal.user?.id}
                    isOpen={editModal.isOpen}
                    onClose={closeEdit}
                    user={editModal.user}
                    roles={rolesData || []}
                />
            )}
        </div>
    );
}

function UserModal({ isOpen, onClose, user, roles }) {
    const queryClient = useQueryClient();
    const isEdit = !!user;

    // Initialize form data directly from props
    const [formData, setFormData] = useState(() => ({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        roles: Array.isArray(user?.roles) ? [...user.roles] : [],
    }));

    // Update form when user prop changes (for edit mode)
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

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/users', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => api.put(`/users/${user?.id}`, data),
        onSuccess: () => {
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
        if (isEdit) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate({ ...payload, password: formData.password });
        }
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
                                        {isEdit ? 'Edit User' : 'Create User'}
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
                                            Password {isEdit && '(leave blank to keep current)'}
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!isEdit}
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
                                            disabled={createMutation.isPending || updateMutation.isPending}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {createMutation.isPending || updateMutation.isPending
                                                ? 'Saving...'
                                                : isEdit
                                                ? 'Update'
                                                : 'Create'}
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
