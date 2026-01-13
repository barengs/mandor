import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Calendar, Flag, User, GripVertical, MessageSquare } from 'lucide-react';
import api from '@/lib/axios';

const priorityConfig = {
    Low: { color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300', dot: 'bg-zinc-400' },
    Medium: { color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300', dot: 'bg-blue-500' },
    High: { color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300', dot: 'bg-orange-500' },
    Urgent: { color: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300', dot: 'bg-red-500' },
};

const TaskCard = ({ task, onClick, onChatClick, isDragging }) => {
    const formatDate = (date) => {
        if (!date) return null;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            onClick={() => onClick?.(task)}
            className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-all group ${isDragging ? 'shadow-lg ring-2 ring-orange-500/50' : 'shadow-sm'}`}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-white flex-1">{task.title}</p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onChatClick?.(task);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-all"
                    title="Open chat"
                >
                    <MessageSquare className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap mt-2">
                {task.priority && (
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${priorityConfig[task.priority]?.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[task.priority]?.dot}`}></span>
                        {task.priority}
                    </span>
                )}
                
                {task.start_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.start_date)}
                    </span>
                )}

                {task.due_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="text-[10px]">→</span>
                        {formatDate(task.due_date)}
                    </span>
                )}
            </div>

            {task.assignees?.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    {task.assignees.slice(0, 2).map((assignee) => (
                        <div
                            key={assignee.id}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-xs text-zinc-600 dark:text-zinc-300"
                        >
                            <span className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-[10px] font-medium text-orange-600 dark:text-orange-400">
                                {assignee.name?.charAt(0).toUpperCase()}
                            </span>
                            {assignee.name?.split(' ')[0]}
                        </div>
                    ))}
                    {task.assignees.length > 2 && (
                        <span className="text-xs text-zinc-400">+{task.assignees.length - 2}</span>
                    )}
                </div>
            )}
        </div>
    );
};

const SortableTaskCard = ({ task, onClick, onChatClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} onClick={onClick} onChatClick={onChatClick} isDragging={isDragging} />
        </div>
    );
};

const KanbanColumn = ({ status, tasks, onTaskClick, onChatClick, onAddTask }) => {
    const taskIds = tasks.map((t) => t.id);

    return (
        <div className="flex-shrink-0 w-72 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl p-3">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                    />
                    <h3 className="font-medium text-zinc-900 dark:text-white text-sm">
                        {status.name}
                    </h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Tasks */}
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 min-h-[100px]">
                    {tasks.map((task) => (
                        <SortableTaskCard key={task.id} task={task} onClick={onTaskClick} onChatClick={onChatClick} />
                    ))}
                </div>
            </SortableContext>

            {/* Add Task Button */}
            <button
                onClick={() => onAddTask(status.id)}
                className="w-full mt-2 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
                + Add Task
            </button>
        </div>
    );
};

const KanbanBoard = ({ statuses, tasks, projectId, onTaskClick, onChatClick, onAddTask }) => {
    const queryClient = useQueryClient();
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const reorderMutation = useMutation({
        mutationFn: (items) => api.post('/tasks/reorder', { items }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        },
    });

    // Group tasks by status
    const tasksByStatus = statuses.reduce((acc, status) => {
        acc[status.id] = tasks.filter((task) => task.status?.id === status.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        return acc;
    }, {});

    const findTaskById = (id) => tasks.find((t) => t.id === id);

    const handleDragStart = (event) => {
        setActiveTask(findTaskById(event.active.id));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeTaskId = active.id;
        const overId = over.id;

        // Find which columns the tasks belong to
        let sourceStatusId = null;
        let destStatusId = null;

        for (const status of statuses) {
            const statusTasks = tasksByStatus[status.id] || [];
            if (statusTasks.some((t) => t.id === activeTaskId)) {
                sourceStatusId = status.id;
            }
            if (statusTasks.some((t) => t.id === overId) || overId === status.id) {
                destStatusId = status.id;
            }
        }

        if (!destStatusId) {
            // Check if dropped on a column itself
            const overStatus = statuses.find((s) => s.id === overId);
            if (overStatus) {
                destStatusId = overStatus.id;
            }
        }

        if (sourceStatusId && destStatusId) {
            const destTasks = [...(tasksByStatus[destStatusId] || [])];
            
            // Calculate new order
            const items = [];
            const movedTask = findTaskById(activeTaskId);
            
            if (sourceStatusId === destStatusId && activeTaskId === overId) {
                return; // No change
            }

            // Build reorder items for the destination column
            let newOrder = 0;
            const overIndex = destTasks.findIndex((t) => t.id === overId);
            
            // If moving to same column, reorder within
            // If moving to different column, add to new position
            const insertIndex = overIndex >= 0 ? overIndex : destTasks.length;
            
            // Remove from source if different column
            const allTasks = destStatusId !== sourceStatusId 
                ? destTasks 
                : destTasks.filter((t) => t.id !== activeTaskId);
            
            // Insert at new position
            allTasks.splice(insertIndex, 0, movedTask);
            
            // Create items for API
            allTasks.forEach((task, index) => {
                items.push({
                    id: task.id,
                    status_id: destStatusId,
                    order: index,
                });
            });

            // If source is different, update remaining source tasks order
            if (sourceStatusId !== destStatusId) {
                const sourceTasks = (tasksByStatus[sourceStatusId] || [])
                    .filter((t) => t.id !== activeTaskId);
                sourceTasks.forEach((task, index) => {
                    items.push({
                        id: task.id,
                        status_id: sourceStatusId,
                        order: index,
                    });
                });
            }

            reorderMutation.mutate(items);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4">
                {statuses.map((status) => (
                    <KanbanColumn
                        key={status.id}
                        status={status}
                        tasks={tasksByStatus[status.id] || []}
                        onTaskClick={onTaskClick}
                        onChatClick={onChatClick}
                        onAddTask={onAddTask}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask && <TaskCard task={activeTask} isDragging />}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;
