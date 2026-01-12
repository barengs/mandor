import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { X, Calendar, Target } from 'lucide-react';

export default function SprintModal({ isOpen, onClose, sprint, projectId }) {
    const queryClient = useQueryClient();
    const isEdit = !!sprint;

    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        if (sprint) {
            setFormData({
                name: sprint.name || '',
                goal: sprint.goal || '',
                start_date: sprint.start_date || '',
                end_date: sprint.end_date || '',
            });
        } else {
            setFormData({
                name: '',
                goal: '',
                start_date: '',
                end_date: '',
            });
        }
    }, [sprint]);

    const createMutation = useMutation({
        mutationFn: (data) => axios.post(`/projects/${projectId}/sprints`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sprints', projectId]);
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data) => axios.put(`/projects/${projectId}/sprints/${sprint.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sprints', projectId]);
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

    const isLoading = createMutation.isPending || updateMutation.isPending;

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
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-zinc-800 shadow-xl transition-all">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                                    <Dialog.Title className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        {isEdit ? 'Edit Sprint' : 'Create Sprint'}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            Sprint Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Sprint 1"
                                            required
                                        />
                                    </div>

                                    {/* Goal */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                            <Target className="w-4 h-4 inline mr-1" />
                                            Sprint Goal
                                        </label>
                                        <textarea
                                            value={formData.goal}
                                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="What do you want to achieve in this sprint?"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !formData.name}
                                            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? 'Saving...' : isEdit ? 'Update Sprint' : 'Create Sprint'}
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
