import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { X, Send, MessageSquare, Reply, Trash2, CornerDownRight, Hash } from 'lucide-react';

const ProjectChat = ({ projectId, isOpen, onClose }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch messages
    const { data: messagesData, isLoading } = useQuery({
        queryKey: ['messages', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/messages`);
            return data;
        },
        enabled: isOpen && !!projectId,
        refetchInterval: 5000, // Poll every 5 seconds
    });

    // Send message mutation
    const sendMessage = useMutation({
        mutationFn: async (data) => {
            const { data: response } = await api.post(`/projects/${projectId}/messages`, data);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
            setMessage('');
            setReplyTo(null);
        },
    });

    // Delete message mutation
    const deleteMessage = useMutation({
        mutationFn: async (messageId) => {
            await api.delete(`/projects/${projectId}/messages/${messageId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
        },
    });

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messagesData]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        sendMessage.mutate({
            content: message.trim(),
            reply_to_id: replyTo?.id || null,
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const formatName = (name) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length === 1) return name;
        return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
    };

    // Messages are returned in desc order, reverse for display
    const messages = messagesData?.data ? [...messagesData.data].reverse() : [];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-zinc-900 shadow-xl flex flex-col border-l border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-zinc-500" />
                    <h2 className="font-semibold text-zinc-900 dark:text-white">Chat</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages - ClickUp style */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                        <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.user?.id === user?.id;
                        const initial = msg.user?.name?.charAt(0).toUpperCase() || '?';
                        const colors = [
                            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
                            'bg-pink-500', 'bg-teal-500', 'bg-orange-500'
                        ];
                        const colorIndex = (msg.user?.id || 0) % colors.length;
                        const avatarColor = colors[colorIndex];
                        
                        return (
                            <div key={msg.id} className="group flex gap-3">
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white ${avatarColor}`}>
                                    {initial}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    {/* Name and Time */}
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-zinc-900 dark:text-white">
                                            {formatName(msg.user?.name)}
                                        </span>
                                        <span className="text-xs text-zinc-400">
                                            {formatTime(msg.created_at)}
                                        </span>
                                        
                                        {/* Actions - show on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setReplyTo(msg);
                                                    inputRef.current?.focus();
                                                }}
                                                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                                title="Reply"
                                            >
                                                <Reply className="w-3.5 h-3.5" />
                                            </button>
                                            {isOwn && (
                                                <button
                                                    onClick={() => deleteMessage.mutate(msg.id)}
                                                    className="p-1 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Reply indicator */}
                                    {msg.reply_to && (
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400 border-l-2 border-zinc-300 dark:border-zinc-600 pl-2">
                                            <span className="truncate">
                                                <span className="font-medium">{formatName(msg.reply_to.user?.name)}</span>: {msg.reply_to.content}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Message content */}
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 whitespace-pre-wrap break-words">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply indicator */}
            {replyTo && (
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 min-w-0">
                        <Reply className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                            Replying to <span className="font-medium">{replyTo.user?.name}</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setReplyTo(null)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                        type="submit"
                        disabled={!message.trim() || sendMessage.isPending}
                        className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectChat;
