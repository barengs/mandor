import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard font (optional, but good for consistency)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#18181b', // zinc-900
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#18181b',
        paddingBottom: 10,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: '#52525b', // zinc-600
        flexDirection: 'row',
        alignItems: 'center',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#e4e4e7', // zinc-200
        paddingBottom: 5,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    card: {
        backgroundColor: '#fafafa', // zinc-50
        borderWidth: 1,
        borderColor: '#f4f4f5', // zinc-100
        padding: 10,
        borderRadius: 4,
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f4f4f5',
    },
    table: {
        width: '100%',
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderBottomColor: '#e4e4e7',
        paddingVertical: 5,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#f4f4f5',
        paddingVertical: 5,
    },
    tableCell: {
        fontSize: 9,
        paddingHorizontal: 4,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 8,
        borderWidth: 1,
    },
    footer: {
        marginTop: 30,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#18181b',
        textAlign: 'center',
        color: '#71717a', // zinc-500
        fontSize: 8,
    },
    textMuted: { color: '#71717a' },
    textBold: { fontWeight: 'bold' },
    textRight: { textAlign: 'right' },
});

// Helper for currency formatting
const formatCurrency = (amount, currency = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

// Helper for date formatting
const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const ProjectReportDocument = ({ project, tasks, members, budget, sprints }) => {
    if (!project) return <Document><Page><Text>Loading...</Text></Page></Document>;

    // Calculations
    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.status?.name?.toLowerCase() === 'done' || t.status?.name?.toLowerCase() === 'complete').length || 0;
    const inProgressTasks = tasks?.filter(t => t.status?.name?.toLowerCase().includes('progress')).length || 0;
    const todoTasks = tasks?.filter(t => t.status?.name?.toLowerCase() === 'todo' || t.status?.name?.toLowerCase() === 'to do').length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{project.name}</Text>
                        <Text style={styles.subtitle}>
                            {project.workspace?.name} • {project.key}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.textMuted, { fontSize: 8 }]}>Report Generated</Text>
                        <Text style={styles.textBold}>{formatDate(new Date())}</Text>
                    </View>
                </View>

                {/* Executive Summary Cards */}
                <View style={styles.grid}>
                    {/* Progress Card */}
                    <View style={styles.card}>
                        <Text style={[styles.textBold, { marginBottom: 5 }]}>Project Progress</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5 }}>
                            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{completionRate}%</Text>
                            <Text style={[styles.textMuted, { marginBottom: 4, marginLeft: 2 }]}>completed</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                            <View><Text style={{ fontWeight: 'bold' }}>{completedTasks}</Text><Text style={[styles.textMuted, { fontSize: 8 }]}>Done</Text></View>
                            <View><Text style={{ fontWeight: 'bold' }}>{inProgressTasks}</Text><Text style={[styles.textMuted, { fontSize: 8 }]}>In Progress</Text></View>
                            <View><Text style={{ fontWeight: 'bold' }}>{todoTasks}</Text><Text style={[styles.textMuted, { fontSize: 8 }]}>To Do</Text></View>
                        </View>
                    </View>

                    {/* Budget Card */}
                    <View style={styles.card}>
                        <Text style={[styles.textBold, { marginBottom: 5 }]}>Budget Overview</Text>
                        <View style={styles.row}>
                            <Text style={styles.textMuted}>Total Budget</Text>
                            <Text style={styles.textBold}>{formatCurrency(budget?.summary?.total_budget, project.currency)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.textMuted}>Total Used</Text>
                            <Text style={styles.textBold}>{formatCurrency(budget?.summary?.total_expenses, project.currency)}</Text>
                        </View>
                        <View style={[styles.row, { borderBottomWidth: 0 }]}>
                            <Text style={styles.textMuted}>Remaining</Text>
                            <Text style={{ 
                                fontWeight: 'bold', 
                                color: (budget?.summary?.remaining_budget || 0) < 0 ? '#dc2626' : '#15803d' 
                            }}>
                                {formatCurrency(budget?.summary?.remaining_budget, project.currency)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Sprints Section */}
                {project.has_sprints && sprints?.length > 0 && (
                    <View style={[styles.section, { marginTop: 20 }]}>
                        <Text style={styles.sectionTitle}>Sprints Status</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold', color: '#52525b' }]}>Sprint Name</Text>
                                <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold', color: '#52525b' }]}>Period</Text>
                                <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#52525b' }]}>Status</Text>
                                <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#52525b', textAlign: 'right' }]}>Completion</Text>
                            </View>
                            {sprints.map((sprint, idx) => {
                                const sprintTasks = tasks?.filter(t => t.sprint_id === sprint.id) || [];
                                const sTotal = sprintTasks.length;
                                const sCompleted = sprintTasks.filter(t => t.status?.name?.toLowerCase() === 'done').length;
                                const sPercentage = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
                                return (
                                    <View key={sprint.id} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { flex: 2 }]}>{sprint.name}</Text>
                                        <Text style={[styles.tableCell, { flex: 2, color: '#52525b' }]}>
                                            {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                                        </Text>
                                        <Text style={[styles.tableCell, { flex: 1 }]}>{sprint.status}</Text>
                                        <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{sPercentage}%</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* All Tasks Table */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>All Tasks</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableCell, { flex: 3, fontWeight: 'bold', color: '#52525b' }]}>Titlte</Text>
                            <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#52525b' }]}>Status</Text>
                            <Text style={[styles.tableCell, { flex: 1, fontWeight: 'bold', color: '#52525b' }]}>Priority</Text>
                            <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold', color: '#52525b' }]}>Assignee</Text>
                            <Text style={[styles.tableCell, { flex: 1.5, fontWeight: 'bold', color: '#52525b' }]}>Due Date</Text>
                        </View>
                        {tasks?.map((task, idx) => (
                            <View key={task.id} style={styles.tableRow} wrap={false}>
                                <View style={{ flex: 3, paddingHorizontal: 4 }}>
                                    <Text>{task.title}</Text>
                                    <Text style={{ fontSize: 8, color: '#71717a' }}>{task.key}</Text>
                                </View>
                                <View style={{ flex: 1, paddingHorizontal: 4 }}>
                                    <Text style={{ 
                                        color: task.status?.name?.toLowerCase() === 'done' ? '#15803d' : '#1d4ed8',
                                        fontSize: 8
                                    }}>
                                        {task.status?.name}
                                    </Text>
                                </View>
                                <View style={{ flex: 1, paddingHorizontal: 4 }}>
                                    <Text style={{
                                        color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#f97316' : '#52525b',
                                        fontSize: 8,
                                        textTransform: 'capitalize'
                                    }}>
                                        {task.priority}
                                    </Text>
                                </View>
                                <View style={{ flex: 1.5, paddingHorizontal: 4 }}>
                                    <Text style={{ fontSize: 8 }}>
                                        {task.assignees?.map(a => a.name.split(' ')[0]).join(', ') || 'Unassigned'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1.5, paddingHorizontal: 4 }}>
                                    <Text style={{ fontSize: 8 }}>{formatDate(task.due_date)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Team Members */}
                <View style={[styles.section, { marginTop: 10, breakInside: 'avoid' }]}>
                    <Text style={styles.sectionTitle}>Team & Resource Allocation</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {members?.map((member, idx) => {
                            const memberBudget = budget?.member_budgets?.find(b => b.user_id === member.id);
                            const memberTasks = tasks?.filter(t => t.assignees?.some(a => a.id === member.id)) || [];
                            const completed = memberTasks.filter(t => t.status?.name?.toLowerCase() === 'done').length;

                            return (
                                <View key={member.id} style={{ 
                                    width: '48%', 
                                    borderWidth: 1, 
                                    borderColor: '#e4e4e7', 
                                    borderRadius: 4, 
                                    padding: 8,
                                    marginBottom: 10
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <View>
                                            <Text style={{ fontWeight: 'bold' }}>{member.name}</Text>
                                            <Text style={{ fontSize: 8, color: '#71717a' }}>{member.email}</Text>
                                            <Text style={{ fontSize: 8, color: '#a1a1aa' }}>{member.pivot?.role}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#52525b' }}>
                                                {memberBudget ? formatCurrency(memberBudget.total_amount) : '-'}
                                            </Text>
                                            <Text style={{ fontSize: 8, color: '#71717a' }}>Allocated</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={{ 
                                        flexDirection: 'row', 
                                        backgroundColor: '#fafafa', 
                                        padding: 4, 
                                        borderRadius: 2 
                                    }}>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <Text style={{ fontSize: 8, color: '#71717a' }}>Tasks: </Text>
                                            <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{memberTasks.length}</Text>
                                        </View>
                                        <View style={{ flex: 1, flexDirection: 'row' }}>
                                            <Text style={{ fontSize: 8, color: '#71717a' }}>Done: </Text>
                                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#15803d' }}>{completed}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer} fixed>
                    Mandor Project Management System • Generated by {project.workspace?.name}
                </Text>
            </Page>
        </Document>
    );
};

export default ProjectReportDocument;
