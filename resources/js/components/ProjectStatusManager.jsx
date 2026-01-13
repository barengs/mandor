import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Plus, GripVertical, Trash2, Edit2, Check, Save } from 'lucide-react';
import api from '@/lib/axios';

const SortableStatusItem = ({ status, onEdit, onDelete, isEditing, editForm, setEditForm, onSaveEdit, onCancelEdit }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: status.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (isEditing) {
        return (
            <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-orange-200 dark:border-orange-900/50">
                <div className="p-2 cursor-move text-zinc-400" {...attributes} {...listeners}>
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                        placeholder="Status Name"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={editForm.color}
                            onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                            className="h-9 w-12 p-0.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md cursor-pointer"
                        />
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onSaveEdit}
                                className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                                title="Save"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onCancelEdit}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                title="Cancel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg group hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
            <div className="p-2 cursor-move text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200" {...attributes} {...listeners}>
                <GripVertical className="w-4 h-4" />
            </div>
            <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: status.color }} 
            />
            <span className="flex-1 font-medium text-zinc-900 dark:text-white text-sm">
                {status.name}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(status)}
                    className="p-1.5 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(status)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const ProjectStatusManager = ({ isOpen, onClose, projectId, statuses = [] }) => {
    const queryClient = useQueryClient();
    const [newStatus, setNewStatus] = useState({ name: '', color: '#3b82f6' }); // Default blue
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', color: '' });
    const [error, setError] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/project-statuses', { ...data, project_id: projectId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['statuses', projectId]);
            setNewStatus({ name: '', color: '#3b82f6' });
            setError('');
        },
        onError: (err) => setError(err.response?.data?.message || 'Failed to create status'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/project-statuses/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['statuses', projectId]);
            setEditingId(null);
            setError('');
        },
        onError: (err) => setError(err.response?.data?.message || 'Failed to update status'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/project-statuses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['statuses', projectId]);
            setError('');
        },
        onError: (err) => setError(err.response?.data?.message || 'Failed to delete status'),
    });

    const reorderMutation = useMutation({
        mutationFn: (items) => api.post('/project-statuses/reorder', { items }),
        onSuccess: () => {
            queryClient.invalidateQueries(['statuses', projectId]);
        },
    });

    const handleCreate = (e) => {
        e.preventDefault();
        if (!newStatus.name.trim()) return;
        createMutation.mutate(newStatus);
    };

    const handleEditClick = (status) => {
        setEditingId(status.id);
        setEditForm({ name: status.name, color: status.color });
        setError('');
    };

    const handleSaveEdit = () => {
        if (!editForm.name.trim()) return;
        updateMutation.mutate({ id: editingId, data: editForm });
    };

    const handleDelete = (status) => {
        if (confirm(`Are you sure you want to delete "${status.name}"?`)) {
            deleteMutation.mutate(status.id);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = statuses.findIndex((s) => s.id === active.id);
            const newIndex = statuses.findIndex((s) => s.id === over.id);
            
            const newStatuses = arrayMove(statuses, oldIndex, newIndex);
            
            // Optimistic update could happen here, but we'll wait for server for now or just trigger mutation
            const items = newStatuses.map((s, index) => ({
                id: s.id,
                order: index,
            }));

            reorderMutation.mutate(items);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        Manage Statuses
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Add New Status */}
                <form onSubmit={handleCreate} className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Add New Status</h3>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newStatus.name}
                            onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                            placeholder="Status Name (e.g., QA, Review)"
                            className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-sm"
                        />
                        <input
                            type="color"
                            value={newStatus.color}
                            onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                            className="h-[38px] w-12 p-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg cursor-pointer"
                        />
                        <button
                            type="submit"
                            disabled={createMutation.isPending || !newStatus.name.trim()}
                            className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {/* Status List */}
                <div className="flex-1 overflow-y-auto min-h-[200px]">
                    <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext 
                            items={statuses.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {statuses.map((status) => (
                                    <SortableStatusItem
                                        key={status.id}
                                        status={status}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                        isEditing={editingId === status.id}
                                        editForm={editForm}
                                        setEditForm={setEditForm}
                                        onSaveEdit={handleSaveEdit}
                                        onCancelEdit={() => { setEditingId(null); setError(''); }}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
                
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 text-center">
                    Drag and drop to reorder statuses.
                </div>
            </div>
        </div>
    );
};

export default ProjectStatusManager;
