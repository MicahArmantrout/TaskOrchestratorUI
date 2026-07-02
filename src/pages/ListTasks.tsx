import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';

type TaskRow = Record<string, unknown>;

type ListTasksProps = {
  isAuthenticated: boolean;
  userId?: string;
  authToken?: string | null;
  refreshTasks?: number;
};

const ListTasksComponent = ({ isAuthenticated, userId, authToken, refreshTasks = 0 }: ListTasksProps) => {
  const location = useLocation();
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [deletingTaskId, setDeletingTaskId] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const authReady = Boolean(isAuthenticated && userId && authToken);

  React.useEffect(() => {
    if (!authReady) {
      setTasks([]);
      setLoading(false);
      if (!isAuthenticated) {
        setError('Please sign in to view your tasks.');
      } else {
        setError('');
      }
      return;
    }

    const fetchTasks = async () => {
      try {
        const payload = (await apiService.getAllTasks(userId, authToken)) as unknown;
        const normalizedTasks = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as { items?: unknown })?.items)
            ? (payload as { items?: unknown[] }).items ?? []
            : Array.isArray((payload as { data?: unknown })?.data)
              ? (payload as { data?: unknown[] }).data ?? []
              : payload
                ? [payload]
                : [];

        setTasks(normalizedTasks as TaskRow[]);
        setError('');
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err) || 'Unable to load tasks.');
        }
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    void fetchTasks();
  }, [authReady, isAuthenticated, userId, authToken, refreshKey, refreshTasks]);

  React.useEffect(() => {
    if (!authReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      setRefreshKey((current) => current + 1);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [authReady, location.key]);

  const visibleColumns = React.useMemo(() => {
    if (!tasks.length) {
      return [] as string[];
    }

    return Object.keys(tasks[0]).filter((key) => key !== 'userId' && key !== 'completedOn' && key !== 'started');
  }, [tasks]);

  const formatCellValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const getTaskId = (row: TaskRow): string | null => {
    const candidate = row.id ?? row.taskId;
    if (candidate === null || candidate === undefined) {
      return null;
    }

    return String(candidate);
  };

  const handleDeleteTask = async (row: TaskRow) => {
    if (!authToken) {
      setError('Missing auth token. Please sign in again.');
      return;
    }

    const taskId = getTaskId(row);
    if (!taskId) {
      setError('Unable to delete task because no task id was found.');
      return;
    }

    const confirmed = window.confirm('Delete this task? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      setDeletingTaskId(taskId);
      await apiService.deleteTask(taskId, authToken);
      setTasks((current) => current.filter((task) => getTaskId(task) !== taskId));
      setError('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err) || 'Unable to delete task.');
      }
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '960px', marginBottom: '1rem', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-h)', textAlign: 'center' }}>Tasks</h2>
        {!loading && isAuthenticated && (
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            style={{
              position: 'absolute',
              right: 0,
              padding: '0.6rem 1rem',
              borderRadius: '999px',
              border: '1px solid var(--accent-border)',
              background: 'var(--accent)',
              color: 'var(--surface)',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)',
            }}
          >
            Refresh tasks
          </button>
        )}
      </div>

      {loading && <p style={{ color: 'var(--text)' }}>Loading tasks...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !isAuthenticated && <p style={{ color: 'var(--text)' }}>Please sign in to access the task grid.</p>}
      {!loading && isAuthenticated && !error && !tasks.length && <p style={{ color: 'var(--text)' }}>No tasks found.</p>}

      {!loading && !error && tasks.length > 0 && (
        <div
          className="task-table-container"
          style={{
            width: '100%',
            maxWidth: '960px',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflowX: 'auto',
            backgroundColor: 'var(--surface)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <table className="task-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {visibleColumns.map((key) => (
                  <th key={key} style={{ borderBottom: '1px solid var(--border)', padding: '0.9rem 1rem', textAlign: 'left', backgroundColor: 'transparent', color: 'var(--text-h)', fontSize: '0.95rem' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())}
                  </th>
                ))}
                <th style={{ borderBottom: '1px solid var(--border)', padding: '0.9rem 1rem', textAlign: 'left', backgroundColor: 'transparent', color: 'var(--text-h)', fontSize: '0.95rem' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((row, rowIndex) => (
                <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? 'transparent' : 'var(--accent-bg)' }}>
                  {visibleColumns.map((key, columnIndex) => {
                    const value = row[key];
                    const cell = formatCellValue(value);

                    if (columnIndex === 0) {
                      return (
                        <td key={key} style={{ borderBottom: '1px solid var(--border)', padding: '0.9rem 1rem' }}>
                          <Link to={`/add-edit/${value}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                            {cell}
                          </Link>
                        </td>
                      );
                    }

                    return (
                      <td key={key} style={{ borderBottom: '1px solid var(--border)', padding: '0.9rem 1rem', color: 'var(--text)' }}>
                        {cell}
                      </td>
                    );
                  })}
                  <td style={{ borderBottom: '1px solid var(--border)', padding: '0.9rem 1rem', color: 'var(--text)' }}>
                    <button
                      type="button"
                      onClick={() => void handleDeleteTask(row)}
                      disabled={deletingTaskId === getTaskId(row)}
                      style={{
                        border: '1px solid var(--danger-border)',
                        background: deletingTaskId === getTaskId(row) ? 'var(--danger-disabled)' : 'var(--danger)',
                        color: '#ffffff',
                        borderRadius: '999px',
                        fontWeight: 600,
                        padding: '0.4rem 0.8rem',
                        cursor: deletingTaskId === getTaskId(row) ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {deletingTaskId === getTaskId(row) ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListTasksComponent;