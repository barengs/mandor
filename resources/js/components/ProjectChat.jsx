import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { encryptMessage, decryptMessage } from '@/lib/crypto';
import { X, Send, MessageSquare, Reply, Trash2, CornerDownRight, Hash, CheckSquare, ChevronDown, AtSign, Paperclip, Mic, MicOff, Image, FileText, Play, Pause, Download, Lock } from 'lucide-react';

const ProjectChat = ({ projectId, isOpen, onClose, tasks = [], members = [], initialTask = null }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [message, setMessage] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskPicker, setShowTaskPicker] = useState(false);
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'task'
    const [filterTaskId, setFilterTaskId] = useState(null);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentionIndex, setMentionIndex] = useState(0);
    const [attachment, setAttachment] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const taskPickerRef = useRef(null);
    const mentionRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    // Set initial task when opening chat from task icon
    useEffect(() => {
        if (isOpen && initialTask) {
            setSelectedTask(initialTask);
            setFilterMode('task');
            setFilterTaskId(initialTask.id);
        }
    }, [isOpen, initialTask]);

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
            const formData = new FormData();
            if (data.content) formData.append('content', data.content);
            if (data.task_id) formData.append('task_id', data.task_id);
            if (data.reply_to_id) formData.append('reply_to_id', data.reply_to_id);
            if (data.attachment) {
                formData.append('attachment', data.attachment);
                formData.append('attachment_type', data.attachment_type);
            }
            
            const { data: response } = await api.post(`/projects/${projectId}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
            setMessage('');
            setReplyTo(null);
            setSelectedTask(null);
            setAttachment(null);
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

    // Close task picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (taskPickerRef.current && !taskPickerRef.current.contains(e.target)) {
                setShowTaskPicker(false);
            }
            if (mentionRef.current && !mentionRef.current.contains(e.target)) {
                setShowMentions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup recording on unmount
    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Handle file selection
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const isImage = file.type.startsWith('image/');
            setAttachment({
                file,
                type: isImage ? 'image' : 'file',
                preview: isImage ? URL.createObjectURL(file) : null,
                name: file.name,
            });
        }
    };

    // Start voice recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                setAttachment({
                    file: audioFile,
                    type: 'voice',
                    preview: URL.createObjectURL(audioBlob),
                    name: audioFile.name,
                    duration: recordingTime,
                });
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('Could not access microphone');
        }
    };

    // Stop voice recording
    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        setIsRecording(false);
    };

    // Format recording time
    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Clear attachment
    const clearAttachment = () => {
        if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Filter members based on search
    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );

    // Handle message input change with mention detection
    const handleMessageChange = (e) => {
        const value = e.target.value;
        setMessage(value);

        // Detect @ mention
        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
            // Check if there's no space after @ (still typing mention)
            if (!textAfterAt.includes(' ')) {
                setMentionSearch(textAfterAt);
                setShowMentions(true);
                setMentionIndex(0);
                return;
            }
        }
        setShowMentions(false);
    };

    // Insert mention into message
    const insertMention = (member) => {
        const cursorPos = inputRef.current?.selectionStart || message.length;
        const textBeforeCursor = message.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = message.slice(cursorPos);

        const newMessage = 
            message.slice(0, lastAtIndex) + 
            `@${member.name} ` + 
            textAfterCursor;
        
        setMessage(newMessage);
        setShowMentions(false);
        inputRef.current?.focus();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && !attachment) return;

        // Encrypt message content before sending
        const encryptedContent = message.trim() ? encryptMessage(message.trim()) : '';

        sendMessage.mutate({
            content: encryptedContent,
            task_id: selectedTask?.id || null,
            reply_to_id: replyTo?.id || null,
            attachment: attachment?.file || null,
            attachment_type: attachment?.type || null,
        });
    };

    const clearSelectedTask = () => {
        setSelectedTask(null);
    };

    const handleKeyDown = (e) => {
        // Handle mention navigation
        if (showMentions && filteredMembers.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setMentionIndex(prev => (prev + 1) % filteredMembers.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setMentionIndex(prev => prev === 0 ? filteredMembers.length - 1 : prev - 1);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertMention(filteredMembers[mentionIndex]);
                return;
            }
            if (e.key === 'Escape') {
                setShowMentions(false);
                return;
            }
        }

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

    // Render message content with highlighted mentions
    const renderMessageContent = (content) => {
        // Decrypt content first
        const decryptedContent = decryptMessage(content);
        
        // Match @mentions (name can have spaces)
        const mentionRegex = /@([\w\s]+?)(?=\s@|\s|$)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(decryptedContent)) !== null) {
            // Add text before mention
            if (match.index > lastIndex) {
                parts.push(decryptedContent.slice(lastIndex, match.index));
            }
            // Add highlighted mention
            const mentionName = match[1].trim();
            parts.push(
                <span key={match.index} className="px-1 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded font-medium">
                    @{mentionName}
                </span>
            );
            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < decryptedContent.length) {
            parts.push(decryptedContent.slice(lastIndex));
        }

        return parts.length > 0 ? parts : decryptedContent;
    };

    // Messages are returned in desc order, reverse for display
    const messages = messagesData?.data ? [...messagesData.data].reverse() : [];

    // Filter messages based on mode
    const filteredMessages = filterMode === 'task' && filterTaskId
        ? messages.filter(msg => msg.task_id === filterTaskId)
        : messages;

    // Get tasks that have messages
    const tasksWithMessages = tasks.filter(task => 
        messages.some(msg => msg.task_id === task.id)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-zinc-900 shadow-xl flex flex-col border-l border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-zinc-500" />
                    <h2 className="font-semibold text-zinc-900 dark:text-white">Chat</h2>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs text-green-700 dark:text-green-400" title="End-to-end encrypted">
                        <Lock className="w-3 h-3" />
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex">
                    <button
                        onClick={() => { setFilterMode('all'); setFilterTaskId(null); }}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                            filterMode === 'all'
                                ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        All Messages
                    </button>
                    <button
                        onClick={() => setFilterMode('task')}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                            filterMode === 'task'
                                ? 'text-orange-600 border-b-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        By Task
                    </button>
                </div>
                
                {/* Task filter dropdown */}
                {filterMode === 'task' && (
                    <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50">
                        <select
                            value={filterTaskId || ''}
                            onChange={(e) => setFilterTaskId(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        >
                            <option value="">Select a task...</option>
                            {tasksWithMessages.length > 0 ? (
                                tasksWithMessages.map(task => (
                                    <option key={task.id} value={task.id}>
                                        {task.title} ({messages.filter(m => m.task_id === task.id).length})
                                    </option>
                                ))
                            ) : (
                                <option disabled>No tasks with messages</option>
                            )}
                        </select>
                    </div>
                )}
            </div>

            {/* Messages - ClickUp style */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 dark:text-zinc-400">
                        <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                        {filterMode === 'task' && filterTaskId ? (
                            <>
                                <p>No messages for this task</p>
                                <p className="text-sm">Start discussing this task!</p>
                            </>
                        ) : (
                            <>
                                <p>No messages yet</p>
                                <p className="text-sm">Start the conversation!</p>
                            </>
                        )}
                    </div>
                ) : (
                    filteredMessages.map((msg) => {
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
                                    {msg.content && (
                                        <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1 whitespace-pre-wrap break-words">
                                            {renderMessageContent(msg.content)}
                                        </p>
                                    )}
                                    
                                    {/* Attachment display */}
                                    {msg.attachment_path && (
                                        <div className="mt-2">
                                            {msg.attachment_type === 'image' && (
                                                <a href={`/storage/${msg.attachment_path}`} target="_blank" rel="noopener noreferrer">
                                                    <img 
                                                        src={`/storage/${msg.attachment_path}`} 
                                                        alt="Attachment" 
                                                        className="max-w-[200px] max-h-[200px] rounded-lg border border-zinc-200 dark:border-zinc-700 hover:opacity-90 transition-opacity"
                                                    />
                                                </a>
                                            )}
                                            {msg.attachment_type === 'voice' && (
                                                <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                                    <Mic className="w-4 h-4 text-orange-500" />
                                                    <audio src={`/storage/${msg.attachment_path}`} controls className="h-8" />
                                                </div>
                                            )}
                                            {msg.attachment_type === 'file' && (
                                                <a 
                                                    href={`/storage/${msg.attachment_path}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate max-w-[150px]">
                                                        {msg.attachment_name || 'Download file'}
                                                    </span>
                                                    <Download className="w-4 h-4 text-zinc-400" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Task tag */}
                                    {msg.task && (
                                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs">
                                            <CheckSquare className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                            <span className="text-orange-700 dark:text-orange-300 font-medium">{msg.task.title}</span>
                                        </div>
                                    )}
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

            {/* Selected task indicator */}
            {selectedTask && (
                <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-200 dark:border-orange-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300 min-w-0">
                        <CheckSquare className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate font-medium">{selectedTask.title}</span>
                    </div>
                    <button
                        onClick={clearSelectedTask}
                        className="p-1 text-orange-400 hover:text-orange-600 dark:hover:text-orange-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                {/* Attachment preview */}
                {attachment && (
                    <div className="mb-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {attachment.type === 'image' && attachment.preview && (
                                    <img src={attachment.preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                                )}
                                {attachment.type === 'voice' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                            <Mic className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <audio src={attachment.preview} controls className="h-8" />
                                    </div>
                                )}
                                {attachment.type === 'file' && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">{attachment.name}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={clearAttachment}
                                className="p-1 text-zinc-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Recording indicator */}
                {isRecording && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-red-700 dark:text-red-300">Recording... {formatRecordingTime(recordingTime)}</span>
                        </div>
                        <button
                            type="button"
                            onClick={stopRecording}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Stop
                        </button>
                    </div>
                )}

                {/* Task picker */}
                <div className="relative mb-2 flex items-center gap-2" ref={taskPickerRef}>
                    <button
                        type="button"
                        onClick={() => setShowTaskPicker(!showTaskPicker)}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Link to task
                        <ChevronDown className={`w-3 h-3 transition-transform ${showTaskPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {/* File input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        title="Attach file"
                    >
                        <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Voice recording button */}
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-1 rounded transition-colors ${isRecording ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        title={isRecording ? 'Stop recording' : 'Voice message'}
                    >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    
                    {showTaskPicker && tasks.length > 0 && (
                        <div className="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-10">
                            {tasks.map((task) => (
                                <button
                                    key={task.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedTask(task);
                                        setShowTaskPicker(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 flex items-center gap-2"
                                >
                                    <CheckSquare className="w-4 h-4 text-zinc-400" />
                                    <span className="truncate text-zinc-700 dark:text-zinc-300">{task.title}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex items-end gap-2 relative">
                    {/* Mention dropdown */}
                    {showMentions && filteredMembers.length > 0 && (
                        <div 
                            ref={mentionRef}
                            className="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20"
                        >
                            <div className="px-3 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                                Team Members
                            </div>
                            {filteredMembers.map((member, index) => (
                                <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => insertMention(member)}
                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                                        index === mentionIndex
                                            ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-xs font-medium text-orange-600 dark:text-orange-400">
                                        {member.name?.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="text-zinc-700 dark:text-zinc-300">{member.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    <textarea
                        ref={inputRef}
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type @ to mention someone..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                        type="submit"
                        disabled={(!message.trim() && !attachment) || sendMessage.isPending}
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
