import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Flag, User, MessageSquare, Trash2, Send, Clock } from 'lucide-react';
import api from '@/lib/axios';

const priorityConfig = {
    Low: { color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400', label: 'Low' },
    Medium: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', label: 'Medium' },
    High: { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', label: 'High' },
    Urgent: { color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'Urgent' },
};

const fetchComments = async (taskId) => {
    const { data } = await api.get('/comments', { params: { task_id: taskId } });
    return data.data;
};

const TaskDetail = ({ task, isOpen, onClose, onEdit, onDelete, statuses }) => {
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');

    const { data: comments, isLoading: commentsLoading } = useQuery({
        queryKey: ['comments', task?.id],
        queryFn: () => fetchComments(task.id),
        enabled: !!task?.id && isOpen,
    });

    const addCommentMutation = useMutation({
        mutationFn: (content) => api.post('/comments', { task_id: task.id, content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', task?.id] });
            setNewComment('');
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => api.delete(`/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', task?.id] });
        },
    });

    const handleSubmitComment = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'No date';
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCommentDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isOpen || !task) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Task Details</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onEdit(task)}
                            className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(task)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                {task.title}
                            </h3>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-3">
                            {/* Status */}
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                    style={{ 
                                        backgroundColor: task.status?.color + '20', 
                                        color: task.status?.color 
                                    }}
                                >
                                    <span 
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: task.status?.color }}
                                    />
                                    {task.status?.name}
                                </span>
                            </div>

                            {/* Priority */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority]?.color}`}>
                                <Flag className="w-3 h-3" />
                                {task.priority}
                            </span>

                            {/* Due Date */}
                            {task.due_date && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(task.due_date)}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {task.description && (
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Description</h4>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                    {task.description}
                                </p>
                            </div>
                        )}

                        {/* Assignees */}
                        {task.assignees?.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Assignees</h4>
                                <div className="flex flex-wrap gap-2">
                                    {task.assignees.map((assignee) => (
                                        <div
                                            key={assignee.id}
                                            className="flex items-center gap-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-medium text-orange-600 dark:text-orange-400">
                                                {assignee.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs text-zinc-700 dark:text-zinc-300">
                                                {assignee.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Created Info */}
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5" />
                            Created {formatDate(task.created_at)} by {task.creator?.name || 'Unknown'}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-zinc-200 dark:border-zinc-800">
                        <div className="p-6">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white mb-4">
                                <MessageSquare className="w-4 h-4" />
                                Comments ({comments?.length || 0})
                            </h4>

                            {/* Comment List */}
                            <div className="space-y-4 mb-4">
                                {commentsLoading ? (
                                    <div className="animate-pulse space-y-3">
                                        <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg"></div>
                                        <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg"></div>
                                    </div>
                                ) : comments?.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="group">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-medium text-orange-600 dark:text-orange-400 flex-shrink-0">
                                                    {comment.user?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {comment.user?.name}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                            {formatCommentDate(comment.created_at)}
                                                        </span>
                                                        <button
                                                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                                        No comments yet
                                    </p>
                                )}
                            </div>

                            {/* Add Comment Form */}
                            <form onSubmit={handleSubmitComment} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-zinc-900 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || addCommentMutation.isPending}
                                    className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskDetail;
