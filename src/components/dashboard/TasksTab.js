'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Repeat,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  X,
  Play,
  UserCheck
} from 'lucide-react';
import { formatDate } from '../../lib/formatters';

const PRIORITIES = ['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['ALL', 'TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

export default function TasksTab() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    priority: 'MEDIUM',
    status: 'TODO',
    assignedTo: 'Sales Support',
    dueDate: '',
    linkedRecord: '',
    recurrence: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [recurrenceLoading, setRecurrenceLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/tasks');
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/crm/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskForm,
          recurrence: taskForm.recurrence || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');

      setFeedback({ type: 'success', message: `Task '${data.task.title}' assigned.` });
      setNewTaskModal(false);
      setTaskForm({
        title: '', priority: 'MEDIUM', status: 'TODO',
        assignedTo: 'Sales Support', dueDate: '', linkedRecord: '', recurrence: ''
      });
      fetchTasks();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch('/api/crm/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');

      fetchTasks();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRunRecurrence = async () => {
    setRecurrenceLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/crm/tasks/recurrence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asOfDate: new Date().toISOString().split('T')[0] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to evaluate recurring schedules');

      setFeedback({
        type: 'success',
        message: `Recurring task engine evaluated: ${data.generatedCount} new scheduled occurrence(s) generated.`
      });
      fetchTasks();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setRecurrenceLoading(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'error' ? '#FEE2E2' : '#DCFCE7',
            color: feedback.type === 'error' ? '#991B1B' : '#166534',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem'
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
            Operational Team Task Board
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Assigned workflows, due dates, linked order/review records, and automated recurring tasks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRunRecurrence}
            disabled={recurrenceLoading}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <Repeat size={14} style={{ marginRight: '6px' }} />
            {recurrenceLoading ? 'Evaluating...' : 'Run Recurrence Engine'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setNewTaskModal(true)}
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <Plus size={15} style={{ marginRight: '4px' }} /> Assign Task
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {STATUSES.map((st) => {
            const count = st === 'ALL' ? tasks.length : tasks.filter((t) => t.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: statusFilter === st ? 'var(--color-burgundy)' : 'var(--color-border)',
                  backgroundColor: statusFilter === st ? 'var(--color-burgundy)' : '#FAF7F2',
                  color: statusFilter === st ? '#FFFFFF' : 'var(--color-charcoal)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '4px 8px', fontSize: '0.78rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
          Loading team tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--color-border)', borderRadius: '4px' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No tasks found for current filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTasks.map((t) => {
            const isDone = t.status === 'DONE';
            const isOverdue = t.dueDate && t.dueDate < todayStr && !isDone;

            return (
              <div
                key={t.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  padding: '14px 18px',
                  backgroundColor: isDone ? '#F9FAFB' : '#FFFFFF',
                  opacity: isDone ? 0.75 : 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '260px' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(t.id, isDone ? 'TODO' : 'DONE')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', color: isDone ? '#166534' : 'var(--color-text-muted)' }}
                    title={isDone ? 'Mark as TODO' : 'Mark as DONE'}
                  >
                    {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.92rem', textDecoration: isDone ? 'line-through' : 'none' }}>
                        {t.title}
                      </strong>
                      <span
                        className={`badge ${
                          t.priority === 'URGENT' || t.priority === 'HIGH'
                            ? 'badge-danger'
                            : t.priority === 'MEDIUM'
                            ? 'badge-warning'
                            : 'badge-demo'
                        }`}
                      >
                        {t.priority}
                      </span>
                      {t.recurrence && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '3px',
                            backgroundColor: '#E0E7FF',
                            color: '#3730A3',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Repeat size={11} /> {t.recurrence}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>Assignee: <strong>{t.assignedTo}</strong></span>
                      {t.dueDate && (
                        <span style={{ color: isOverdue ? '#DC2626' : 'inherit', fontWeight: isOverdue ? 600 : 'normal' }}>
                          Due: {t.dueDate} {isOverdue ? '(OVERDUE)' : ''}
                        </span>
                      )}
                      {t.linkedRecord && (
                        <span>Linked: <code>{t.linkedRecord}</code></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['TODO', 'IN_PROGRESS', 'DONE'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(t.id, st)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        borderRadius: '3px',
                        border: '1px solid',
                        borderColor: t.status === st ? 'var(--color-burgundy)' : 'var(--color-border)',
                        backgroundColor: t.status === st ? 'var(--color-burgundy)' : '#FAF7F2',
                        color: t.status === st ? '#FFFFFF' : 'var(--color-charcoal)',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ASSIGN TASK */}
      {newTaskModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(26, 10, 14, 0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>Assign Team Task</h3>
              <button onClick={() => setNewTaskModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect return batch RET-051"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Assignee</label>
                  <input
                    type="text"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Recurrence Schedule</label>
                  <select
                    value={taskForm.recurrence}
                    onChange={(e) => setTaskForm({ ...taskForm, recurrence: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  >
                    <option value="">None (One-time Task)</option>
                    <option value="DAILY">Daily Recurrence</option>
                    <option value="WEEKLY">Weekly Recurrence</option>
                    <option value="MONTHLY">Monthly Recurrence</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Linked Record</label>
                <input
                  type="text"
                  placeholder="e.g. Order NSK-2026-1082 or Review rev-001"
                  value={taskForm.linkedRecord}
                  onChange={(e) => setTaskForm({ ...taskForm, linkedRecord: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setNewTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
