import { useState, Fragment, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import {
    ShieldCheckIcon,
    PlusIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import api from '../../lib/axios';

const permissionGroups = {
    users: { label: 'Users', icon: '👥' },
    roles: { label: 'Roles', icon: '🛡️' },
    workspaces: { label: 'Workspaces', icon: '🏢' },
    projects: { label: 'Projects', icon: '📁' },
    tasks: { label: 'Tasks', icon: '✅' },
};

export default function RoleManagement() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Fetch roles
    const { data: rolesData, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const { data } = await api.get('/roles');
            return data.data;
        },
    });

    // Fetch permissions
    const { data: permissionsData } = useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            const { data } = await api.get('/permissions');
            return data;
        },
    });

    // Delete role mutation
    const deleteMutation = useMutation({
        mutationFn: (roleId) => api.delete(`/roles/${roleId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
        },
    });

    const handleDelete = (role) => {
        if (['Super Admin', 'Admin'].includes(role.name)) {
            alert('Cannot delete system roles');
            return;
        }
        if (confirm(`Are you sure you want to delete role "${role.name}"?`)) {
            deleteMutation.mutate(role.id);
        }
    };

    const openEdit = (role) => {
        setSelectedRole(role);
        setIsEditOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Role Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Manage roles and permissions
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Create Role
                    </button>
                </div>

                {/* Roles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow animate-pulse"
                            >
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        ))
                    ) : (
                        rolesData?.map((role) => (
                            <div
                                key={role.id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                            <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {role.name}
                                            </h3>
                                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                <UserGroupIcon className="h-4 w-4" />
                                                {role.users_count} users
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(role)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        {!['Super Admin', 'Admin'].includes(role.name) && (
                                            <button
                                                onClick={() => handleDelete(role)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Permissions ({role.permissions?.length || 0})
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {role.permissions?.slice(0, 5).map((perm) => (
                                            <span
                                                key={perm}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                            >
                                                {perm}
                                            </span>
                                        ))}
                                        {role.permissions?.length > 5 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                                +{role.permissions.length - 5} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Role Modal */}
            <RoleModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                permissions={permissionsData?.grouped || {}}
                allPermissions={permissionsData?.data || []}
            />

            {/* Edit Role Modal */}
            <RoleModal
                isOpen={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    setSelectedRole(null);
                }}
                role={selectedRole}
                permissions={permissionsData?.grouped || {}}
                allPermissions={permissionsData?.data || []}
            />
        </div>
    );
}

function RoleModal({ isOpen, onClose, role, permissions, allPermissions }) {
    const queryClient = useQueryClient();
    const isEdit = !!role;

    const [formData, setFormData] = useState({
        name: '',
        permissions: [],
    });

    // Reset form when modal opens or role changes
    useEffect(() => {
        if (isOpen) {
            if (role) {
                setFormData({
                    name: role.name || '',
                    permissions: role.permissions || [],
                });
            } else {
                setFormData({
                    name: '',
                    permissions: [],
                });
            }
        }
    }, [isOpen, role]);

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/roles', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => api.put(`/roles/${role?.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['roles']);
            onClose();
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    const togglePermission = (perm) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter((p) => p !== perm)
                : [...prev.permissions, perm],
        }));
    };

    const toggleGroup = (groupPerms) => {
        const allSelected = groupPerms.every((p) => formData.permissions.includes(p));
        if (allSelected) {
            setFormData((prev) => ({
                ...prev,
                permissions: prev.permissions.filter((p) => !groupPerms.includes(p)),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                permissions: [...new Set([...prev.permissions, ...groupPerms])],
            }));
        }
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
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {isEdit ? 'Edit Role' : 'Create Role'}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Role Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            disabled={isEdit && ['Super Admin', 'Admin'].includes(role?.name)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Permissions
                                        </label>
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {Object.entries(permissions).map(([group, perms]) => {
                                                const groupInfo = permissionGroups[group] || { label: group, icon: '📋' };
                                                const allSelected = perms.every((p) => formData.permissions.includes(p));
                                                const someSelected = perms.some((p) => formData.permissions.includes(p));

                                                return (
                                                    <div
                                                        key={group}
                                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">{groupInfo.icon}</span>
                                                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                                    {groupInfo.label}
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleGroup(perms)}
                                                                className={`text-xs px-2 py-1 rounded ${
                                                                    allSelected
                                                                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                                }`}
                                                            >
                                                                {allSelected ? 'Deselect All' : 'Select All'}
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {perms.map((perm) => (
                                                                <button
                                                                    key={perm}
                                                                    type="button"
                                                                    onClick={() => togglePermission(perm)}
                                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                                                        formData.permissions.includes(perm)
                                                                            ? 'bg-indigo-600 text-white'
                                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                                    }`}
                                                                >
                                                                    {formData.permissions.includes(perm) && (
                                                                        <CheckIcon className="h-4 w-4" />
                                                                    )}
                                                                    {perm}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
