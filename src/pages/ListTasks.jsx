import * as React from 'react';
import { Link } from 'react-router-dom';
import { SimpleTable } from '@simple-table/react';


import "@simple-table/react/styles.css";


const ListTasksComponent = () => {
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5112/api/Task');

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const normalizedTasks = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.data)
              ? payload.data
              : payload
                ? [payload]
                : [];

        setTasks(normalizedTasks);
      } catch (err) {
        setError(err.message || 'Unable to load tasks.');
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

    const formatCellValue = (value) => {
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
      width: 180,
      isSortable: true,
      valueFormatter: ({ value }) => formatCellValue(value),
      cellRenderer:
        index === 0
          ? ({ value }) => (
              <Link to="/" style={{ color: '#2563eb', textDecoration: 'none' }}>
                {formatCellValue(value)}
              </Link>
            )
          : undefined,
    }));
  }, [tasks]);

  return (
    <div style={{ padding: '0.25rem 0 0.5rem', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '20px',
          boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
          padding: '1.25rem',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>Tasks</h2>

        {loading && <p style={{ textAlign: 'center' }}>Loading tasks...</p>}
        {error && <p style={{ color: 'crimson', textAlign: 'center' }}>{error}</p>}

        {!loading && !error && !tasks.length && <p style={{ textAlign: 'center' }}>No tasks found.</p>}

        {!loading && !error && tasks.length > 0 && (
          <div
            style={{
              height: 420,
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)',
              margin: '0 auto',
            }}
          >
            <SimpleTable rows={tasks} defaultHeaders={headers} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ListTasksComponent;