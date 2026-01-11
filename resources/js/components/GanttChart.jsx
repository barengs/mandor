import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const priorityColors = {
    Low: 'bg-zinc-400',
    Medium: 'bg-blue-500',
    High: 'bg-orange-500',
    Urgent: 'bg-red-500',
};

const GanttChart = ({ tasks, statuses, onTaskClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'

    // Calculate date range based on view mode
    const dateRange = useMemo(() => {
        const dates = [];
        const start = new Date(currentDate);
        
        if (viewMode === 'week') {
            // Start from Monday of current week
            const day = start.getDay();
            const diff = start.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            
            for (let i = 0; i < 14; i++) { // 2 weeks
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                dates.push(date);
            }
        } else {
            // Month view - start from 1st of month
            start.setDate(1);
            const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
            
            for (let i = 0; i < daysInMonth; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                dates.push(date);
            }
        }
        
        return dates;
    }, [currentDate, viewMode]);

    const navigate = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 14));
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const formatHeaderDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    };

    const formatMonthYear = () => {
        const start = dateRange[0];
        const end = dateRange[dateRange.length - 1];
        
        if (start.getMonth() === end.getMonth()) {
            return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    // Parse date string to local date (avoiding timezone issues)
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        // Extract just the date part (YYYY-MM-DD) to avoid timezone issues
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // Helper to compare dates (ignoring time)
    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    // Find index of a date in the dateRange array
    const findDateIndex = (targetDate) => {
        for (let i = 0; i < dateRange.length; i++) {
            if (isSameDay(dateRange[i], targetDate)) return i;
        }
        return -1;
    };

    // Cell width in pixels: w-16 = 64px for week, w-10 = 40px for month
    const cellWidthPx = viewMode === 'week' ? 64 : 40;

    // Calculate task bar position and width
    const getTaskBar = (task) => {
        if (!task.start_date && !task.due_date) return null;

        const startDate = parseDate(task.start_date) || parseDate(task.due_date);
        const endDate = parseDate(task.due_date) || parseDate(task.start_date);
        
        const rangeStart = dateRange[0];
        const rangeEnd = dateRange[dateRange.length - 1];

        // Check if task is within visible range
        if (endDate < rangeStart || startDate > rangeEnd) return null;

        const effectiveStart = startDate < rangeStart ? rangeStart : startDate;
        const effectiveEnd = endDate > rangeEnd ? rangeEnd : endDate;

        // Find exact indices in the dateRange array
        let startIdx = findDateIndex(effectiveStart);
        let endIdx = findDateIndex(effectiveEnd);

        // If date not found in range, calculate offset
        if (startIdx === -1) {
            startIdx = Math.max(0, Math.round((effectiveStart - rangeStart) / (1000 * 60 * 60 * 24)));
        }
        if (endIdx === -1) {
            endIdx = Math.min(dateRange.length - 1, Math.round((effectiveEnd - rangeStart) / (1000 * 60 * 60 * 24)));
        }

        const duration = endIdx - startIdx + 1;

        return {
            left: `${startIdx * cellWidthPx}px`,
            width: `${duration * cellWidthPx}px`,
        };
    };

    // Group tasks by status for better organization
    const tasksByStatus = useMemo(() => {
        const grouped = {};
        statuses.forEach(status => {
            grouped[status.id] = {
                status,
                tasks: tasks.filter(t => t.status?.id === status.id),
            };
        });
        return grouped;
    }, [tasks, statuses]);

    const cellWidth = viewMode === 'week' ? 'w-16' : 'w-10';

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {/* Header Controls */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                    </button>
                    <span className="ml-2 text-lg font-semibold text-zinc-900 dark:text-white">
                        {formatMonthYear()}
                    </span>
                </div>
                
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            viewMode === 'week'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                    >
                        2 Weeks
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            viewMode === 'month'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                    >
                        Month
                    </button>
                </div>
            </div>

            {/* Gantt Grid */}
            <div className="overflow-x-auto">
                <div className="min-w-max">
                    {/* Date Headers */}
                    <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                        <div className="w-64 flex-shrink-0 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-r border-zinc-200 dark:border-zinc-700">
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Task</span>
                        </div>
                        <div className="flex">
                            {dateRange.map((date, index) => (
                                <div
                                    key={index}
                                    className={`${cellWidth} flex-shrink-0 px-1 py-2 text-center border-r border-zinc-100 dark:border-zinc-800 ${
                                        isToday(date)
                                            ? 'bg-orange-50 dark:bg-orange-900/20'
                                            : isWeekend(date)
                                            ? 'bg-zinc-50 dark:bg-zinc-800/30'
                                            : ''
                                    }`}
                                >
                                    <div className={`text-xs font-medium ${
                                        isToday(date) 
                                            ? 'text-orange-600 dark:text-orange-400' 
                                            : 'text-zinc-500 dark:text-zinc-400'
                                    }`}>
                                        {viewMode === 'week' ? formatHeaderDate(date) : date.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Task Rows grouped by Status */}
                    {statuses.map(status => {
                        const statusTasks = tasksByStatus[status.id]?.tasks || [];
                        if (statusTasks.length === 0) return null;

                        return (
                            <div key={status.id}>
                                {/* Status Header */}
                                <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                                    <div className="w-64 flex-shrink-0 px-4 py-2 border-r border-zinc-200 dark:border-zinc-700">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                {status.name}
                                            </span>
                                            <span className="text-xs text-zinc-400">({statusTasks.length})</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-1">
                                        {dateRange.map((date, index) => (
                                            <div
                                                key={index}
                                                className={`${cellWidth} flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800 ${
                                                    isToday(date)
                                                        ? 'bg-orange-50 dark:bg-orange-900/20'
                                                        : isWeekend(date)
                                                        ? 'bg-zinc-100/50 dark:bg-zinc-800/50'
                                                        : ''
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Tasks */}
                                {statusTasks.map(task => {
                                    const bar = getTaskBar(task);
                                    
                                    return (
                                        <div
                                            key={task.id}
                                            className="flex h-8 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                                        >
                                            {/* Task Name */}
                                            <div
                                                onClick={() => onTaskClick?.(task)}
                                                className="w-64 flex-shrink-0 px-4 border-r border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center"
                                            >
                                                <div className="truncate">
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate leading-tight">
                                                        {task.title}
                                                    </p>
                                                    {task.assignees?.length > 0 && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate leading-tight">
                                                            {task.assignees.map(a => a.name?.split(' ')[0]).join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Timeline Grid */}
                                            <div className="flex flex-1 relative items-stretch">
                                                {dateRange.map((date, index) => (
                                                    <div
                                                        key={index}
                                                        className={`${cellWidth} flex-shrink-0 border-r border-zinc-100 dark:border-zinc-800 ${
                                                            isToday(date)
                                                                ? 'bg-orange-50 dark:bg-orange-900/20'
                                                                : isWeekend(date)
                                                                ? 'bg-zinc-50 dark:bg-zinc-800/30'
                                                                : ''
                                                        }`}
                                                    />
                                                ))}

                                                {/* Task Bar */}
                                                {bar && (
                                                    <div
                                                        onClick={() => onTaskClick?.(task)}
                                                        className={`absolute top-1 bottom-1 ${priorityColors[task.priority] || 'bg-blue-500'} rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2 overflow-hidden shadow-sm`}
                                                        style={{ left: bar.left, width: bar.width }}
                                                        title={`${task.title} (${task.start_date ? new Date(task.start_date).toLocaleDateString() : ''} - ${task.due_date ? new Date(task.due_date).toLocaleDateString() : ''})`}
                                                    >
                                                        <span className="text-xs font-medium text-white truncate">
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {tasks.length === 0 && (
                        <div className="flex items-center justify-center py-12 text-zinc-500 dark:text-zinc-400">
                            <Calendar className="w-5 h-5 mr-2" />
                            No tasks to display
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GanttChart;
