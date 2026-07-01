import * as React from 'react';
import { Link } from 'react-router-dom';
import { SimpleTable } from '@simple-table/react';
import '@simple-table/react/styles.css';
import { apiService } from '../services/apiService';

type TaskRow = Record<string, unknown>;

type CellValueProps = {
  value: unknown;
};

const ListTasksComponent = () => {
  const [tasks, setTasks] = React.useState<TaskRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const payload = (await apiService.getAllTasks()) as unknown;
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

    fetchTasks();
  }, []);

  const headers = React.useMemo(() => {
    if (!tasks.length) {
      return [];
    }

    const formatCellValue = (value: unknown) => {
      if (value === null || value === undefined) {
        return '';
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }

      return String(value);
    };

    return Object.keys(tasks[0]).map((key, index) => ({
      accessor: key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()),
      width: 140,
      isSortable: true,
      valueFormatter: ({ value }: CellValueProps) => formatCellValue(value),
      cellRenderer:
        index === 0
          ? ({ value }: CellValueProps) => (
              <Link to={`/add-edit/${value}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                {formatCellValue(value)}
              </Link>
            )
          : undefined,
    }));
  }, [tasks]);

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Tasks</h2>

      {loading && <p>Loading tasks...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {!loading && !error && !tasks.length && <p>No tasks found.</p>}

      {!loading && !error && tasks.length > 0 && (
        <div
          style={{
            height: 420,
            border: '1px solid #d0d7de',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
          }}
        >
          <SimpleTable rows={tasks} defaultHeaders={headers} />
        </div>
      )}
    </div>
  );
};

export default ListTasksComponent;