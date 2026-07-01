import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AddEditTask from './pages/AddEditTask.jsx';
import ListTasksComponent from './pages/ListTasks.tsx';

function App() {
  return (
    <BrowserRouter>
      <div className="App" style={{ padding: '1.5rem 1rem 3rem' }}>
        <header
          className="App-header"
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '24px',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
            padding: '1.75rem 1.5rem 2rem',
          }}
        >
          <h2 style={{ margin: '0 0 1rem', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center' }}>
            Task Orchestrator
          </h2>
          <nav style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link
              to="/tasks"
              style={{
                textDecoration: 'none',
                color: '#2563eb',
                background: '#eff6ff',
                padding: '0.65rem 1rem',
                borderRadius: '999px',
                fontWeight: 600,
              }}
            >
              Tasks
            </Link>
            <Link
              to="/add-edit"
              style={{
                textDecoration: 'none',
                color: '#2563eb',
                background: '#eff6ff',
                padding: '0.65rem 1rem',
                borderRadius: '999px',
                fontWeight: 600,
              }}
            >
              Add/Edit Task
            </Link>
          </nav>

          <Routes>
            <Route path="/" element={<ListTasksComponent />} />
            <Route path="/tasks" element={<ListTasksComponent />} />
            <Route path="/add-edit" element={<AddEditTask />} />
            <Route path="/add-edit/:id" element={<AddEditTask />} />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
