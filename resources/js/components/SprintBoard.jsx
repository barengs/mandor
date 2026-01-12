import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from '@/lib/axios';
import { 
    Plus, 
    ChevronDown, 
    ChevronRight, 
    Play, 
    CheckCircle, 
    Calendar,
    Target,
    MoreHorizontal,
    Trash2,
    Edit2
} from 'lucide-react';
import SprintModal from './SprintModal';

// Sortable Task Item
function SortableTaskItem({ task, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `task-${task.id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors = {
        low: 'bg-gray-100 text-gray-600',
        medium: 'bg-blue-100 text-blue-600',
        high: 'bg-orange-100 text-orange-600',
        urgent: 'bg-red-100 text-red-600',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
                    {task.title}
                </h4>
                {task.priority && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                        {task.priority}
                    </span>
                )}
            </div>
            {task.assignees?.length > 0 && (
                <div className="mt-2 flex items-center gap-1">
                    {task.assignees.slice(0, 3).map(a => (
                        <span key={a.id} className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center">
                            {a.name?.charAt(0).toUpperCase()}
                        </span>
                    ))}
                </div>
            )}
            {(task.start_date || task.due_date) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    {task.start_date && new Date(task.start_date).toLocaleDateString()}
                    {task.start_date && task.due_date && ' → '}
                    {task.due_date && new Date(task.due_date).toLocaleDateString()}
                </div>
            )}
        </div>
    );
}

// Backlog Droppable Component
function BacklogDropZone({ tasks, onTaskClick }) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'backlog',
    });

    return (
        <div 
            ref={setNodeRef}
            className={`p-4 min-h-[200px] max-h-[600px] overflow-y-auto bg-white dark:bg-zinc-900 transition-colors ${
                isOver ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-300 ring-inset' : ''
            }`}
        >
            <SortableContext items={tasks.map(t => `task-${t.id}`)} strategy={verticalListSortingStrategy}>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <SortableTaskItem
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                        No tasks in backlog
                    </div>
                )}
            </SortableContext>
        </div>
    );
}

// Sprint Section Component
function SprintSection({ sprint, tasks, onTaskClick, onEditSprint, onStartSprint, onCompleteSprint, onDeleteSprint }) {
    const [isExpanded, setIsExpanded] = useState(sprint.status === 'active' || sprint.status === 'planning');
    
    const { setNodeRef, isOver } = useDroppable({
        id: `sprint-${sprint.id}`,
    });

    const statusColors = {
        planning: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        active: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        completed: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    };

    const sprintTasks = tasks.filter(t => t.sprint_id === sprint.id);

    return (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden mb-4">
            {/* Sprint Header */}
            <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-500">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-zinc-900 dark:text-white">{sprint.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[sprint.status]}`}>
                                {sprint.status}
                            </span>
                            <span className="text-xs text-zinc-500">({sprintTasks.length} tasks)</span>
                        </div>
                        {(sprint.start_date || sprint.end_date) && (
                            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                <Calendar className="w-3 h-3" />
                                {sprint.start_date} - {sprint.end_date}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {sprint.status === 'planning' && (
                        <button
                            onClick={() => onStartSprint(sprint)}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            <Play className="w-3 h-3" /> Start
                        </button>
                    )}
                    {sprint.status === 'active' && (
                        <button
                            onClick={() => onCompleteSprint(sprint)}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            <CheckCircle className="w-3 h-3" /> Complete
                        </button>
                    )}
                    <button
                        onClick={() => onEditSprint(sprint)}
                        className="p-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDeleteSprint(sprint)}
                        className="p-1 text-zinc-500 hover:text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Sprint Goal */}
            {sprint.goal && isExpanded && (
                <div className="px-4 py-2 bg-zinc-25 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Target className="w-4 h-4" />
                        <span>{sprint.goal}</span>
                    </div>
                </div>
            )}

            {/* Sprint Tasks - Droppable Area */}
            {isExpanded && (
                <div 
                    ref={setNodeRef}
                    className={`p-4 min-h-[100px] bg-white dark:bg-zinc-900 transition-colors ${
                        isOver ? 'bg-orange-50 dark:bg-orange-900/20 ring-2 ring-orange-300 ring-inset' : ''
                    }`}
                >
                    <SortableContext items={sprintTasks.map(t => `task-${t.id}`)} strategy={verticalListSortingStrategy}>
                        {sprintTasks.length > 0 ? (
                            sprintTasks.map(task => (
                                <SortableTaskItem
                                    key={task.id}
                                    task={task}
                                    onClick={() => onTaskClick(task)}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-zinc-400 text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                                Drag tasks here to add to sprint
                            </div>
                        )}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}

// Main Sprint Board Component
export default function SprintBoard({ project, onTaskClick }) {
    const queryClient = useQueryClient();
    const [sprintModal, setSprintModal] = useState({ isOpen: false, sprint: null });
    const [backlogExpanded, setBacklogExpanded] = useState(true);
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    // Fetch sprints
    const { data: sprints = [] } = useQuery({
        queryKey: ['sprints', project.id],
        queryFn: async () => {
            const res = await axios.get(`/projects/${project.id}/sprints`);
            return res.data.data;
        },
    });

    // Fetch backlog tasks
    const { data: backlogData } = useQuery({
        queryKey: ['backlog', project.id],
        queryFn: async () => {
            const res = await axios.get(`/projects/${project.id}/backlog`);
            return res.data;
        },
    });

    // Fetch all tasks
    const { data: allTasks = [] } = useQuery({
        queryKey: ['tasks', { project_id: project.id }],
        queryFn: async () => {
            const res = await axios.get('/tasks', { params: { project_id: project.id } });
            return res.data.data;
        },
    });

    const backlogTasks = backlogData?.tasks || allTasks.filter(t => !t.sprint_id);

    // Move task mutation
    const moveTaskMutation = useMutation({
        mutationFn: ({ taskId, sprintId }) => 
            axios.post(`/projects/${project.id}/move-task`, { task_id: taskId, sprint_id: sprintId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks']);
            queryClient.invalidateQueries(['backlog']);
            queryClient.invalidateQueries(['sprints']);
        },
    });

    // Sprint actions
    const startSprintMutation = useMutation({
        mutationFn: (sprint) => axios.post(`/projects/${project.id}/sprints/${sprint.id}/start`),
        onSuccess: () => queryClient.invalidateQueries(['sprints']),
    });

    const completeSprintMutation = useMutation({
        mutationFn: (sprint) => axios.post(`/projects/${project.id}/sprints/${sprint.id}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries(['sprints']);
            queryClient.invalidateQueries(['tasks']);
            queryClient.invalidateQueries(['backlog']);
        },
    });

    const deleteSprintMutation = useMutation({
        mutationFn: (sprint) => axios.delete(`/projects/${project.id}/sprints/${sprint.id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['sprints']);
            queryClient.invalidateQueries(['tasks']);
            queryClient.invalidateQueries(['backlog']);
        },
    });

    // Drag handlers
    const handleDragStart = (event) => {
        const taskId = event.active.id.replace('task-', '');
        const task = allTasks.find(t => t.id === parseInt(taskId));
        setActiveTask(task);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = parseInt(active.id.replace('task-', ''));
        const overId = over.id;

        // Determine target sprint
        let targetSprintId = null;
        if (overId === 'backlog') {
            targetSprintId = null;
        } else if (overId.startsWith('sprint-')) {
            targetSprintId = parseInt(overId.replace('sprint-', ''));
        } else if (overId.startsWith('task-')) {
            // Dropped on another task - find its sprint
            const overTaskId = parseInt(overId.replace('task-', ''));
            const overTask = allTasks.find(t => t.id === overTaskId);
            targetSprintId = overTask?.sprint_id || null;
        }

        const currentTask = allTasks.find(t => t.id === taskId);
        if (currentTask?.sprint_id !== targetSprintId) {
            moveTaskMutation.mutate({ taskId, sprintId: targetSprintId });
        }
    };

    const handleDeleteSprint = (sprint) => {
        if (confirm(`Delete "${sprint.name}"? Tasks will be moved to backlog.`)) {
            deleteSprintMutation.mutate(sprint);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Sprint Planning</h2>
                    <button
                        onClick={() => setSprintModal({ isOpen: true, sprint: null })}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <Plus className="w-4 h-4" />
                        New Sprint
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Backlog Column */}
                    <div className="lg:col-span-1">
                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                            <div 
                                className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 flex items-center justify-between cursor-pointer"
                                onClick={() => setBacklogExpanded(!backlogExpanded)}
                            >
                                <div className="flex items-center gap-2">
                                    {backlogExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                    <h3 className="font-semibold text-zinc-900 dark:text-white">Backlog</h3>
                                    <span className="text-xs text-zinc-500">({backlogTasks.length})</span>
                                </div>
                            </div>
                            {backlogExpanded && (
                                <BacklogDropZone 
                                    tasks={backlogTasks} 
                                    onTaskClick={onTaskClick} 
                                />
                            )}
                        </div>
                    </div>

                    {/* Sprints Column */}
                    <div className="lg:col-span-2">
                        {sprints.length > 0 ? (
                            sprints.map(sprint => (
                                <SprintSection
                                    key={sprint.id}
                                    sprint={sprint}
                                    tasks={allTasks}
                                    onTaskClick={onTaskClick}
                                    onEditSprint={(s) => setSprintModal({ isOpen: true, sprint: s })}
                                    onStartSprint={(s) => startSprintMutation.mutate(s)}
                                    onCompleteSprint={(s) => completeSprintMutation.mutate(s)}
                                    onDeleteSprint={handleDeleteSprint}
                                />
                            ))
                        ) : (
                            <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center">
                                <p className="text-zinc-500 mb-4">No sprints yet</p>
                                <button
                                    onClick={() => setSprintModal({ isOpen: true, sprint: null })}
                                    className="text-orange-500 hover:text-orange-600 font-medium"
                                >
                                    Create your first sprint
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeTask && (
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
                        <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
                            {activeTask.title}
                        </h4>
                    </div>
                )}
            </DragOverlay>

            {/* Sprint Modal */}
            <SprintModal
                isOpen={sprintModal.isOpen}
                onClose={() => setSprintModal({ isOpen: false, sprint: null })}
                sprint={sprintModal.sprint}
                projectId={project.id}
            />
        </DndContext>
    );
}
