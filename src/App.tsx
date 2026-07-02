import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import AddEditTask from './pages/AddEditTask.jsx';
import ListTasksComponent from './pages/ListTasks.tsx';

declare global {
  interface Window {
    google?: any;
  }
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [user, setUser] = useState<null | { id: string; name: string; email: string; picture?: string }>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authUiError, setAuthUiError] = useState<string | null>(null);
  const [refreshTasks, setRefreshTasks] = useState(0);
  const googleInitializedRef = useRef(false);

  const isGoogleOriginError = (text: string) =>
    /given origin is not allowed for the given client id/i.test(text);

  const handleGoogleUiContent = (container: HTMLElement) => {
    const message = container.textContent ?? '';
    if (!isGoogleOriginError(message)) {
      return;
    }

    container.innerHTML = '';
    container.style.display = 'none';
    setAuthUiError(
      'Google Sign-In is not configured for this app origin. Add this URL to Authorized JavaScript origins in Google Cloud Console.'
    );
  };

  const renderGoogleButton = () => {
    if (!window.google?.accounts?.id) {
      return;
    }

    const container = document.getElementById('google-signin-btn');
    if (!container) {
      return;
    }

    container.style.display = '';
    container.innerHTML = '';
    setAuthUiError(null);

    window.google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: '240px',
      type: 'standard',
    });

    // GIS can inject origin/client errors directly into the container.
    requestAnimationFrame(() => handleGoogleUiContent(container));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('Missing VITE_GOOGLE_CLIENT_ID in environment variables');
      return;
    }

    const handleCredentialResponse = (response: any) => {
      if (!response?.credential) {
        return;
      }
        console.log('token: ' + response.credential);
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(decoded);
        setUser({ id: payload.sub, name: payload.name, email: payload.email, picture: payload.picture });
        setAuthToken(response.credential);
        setRefreshTasks((current) => current + 1);
      } catch (error) {
        console.error('Google credential parse error:', error);
      }
    };

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      if (googleInitializedRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        use_fedcm_for_prompt: false,
      });

      googleInitializedRef.current = true;
      renderGoogleButton();
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.getElementById('google-client-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = 'google-client-script';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const container = document.getElementById('google-signin-btn');
    if (!container) {
      return;
    }

    const observer = new MutationObserver(() => handleGoogleUiContent(container));
    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = document.getElementById('google-signin-btn');

    if (user) {
      if (el) {
        el.innerHTML = '';
        (el as HTMLElement).style.display = 'none';
      }

      if (window.google?.accounts?.id?.disableAutoSelect) {
        try {
          window.google.accounts.id.disableAutoSelect();
        } catch {
          // ignore
        }
      }

      return;
    }

    renderGoogleButton();
  }, [user]);

  const handleSignOut = () => {
    setUser(null);
    setAuthToken(null);
  };

  return (
    <BrowserRouter>
      <div className="App app-shell" style={{ padding: '1.5rem 1rem 3rem' }}>
        <header
          className="App-header"
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            boxShadow: 'var(--shadow)',
            padding: '1.75rem 1.5rem 2rem',
          }}
        >
          <h2 style={{ margin: '0 0 1rem', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', textAlign: 'center', color: 'var(--text-h)' }}>
            Task Orchestrator
          </h2>
          <div className="app-top-controls">
            <nav className="app-nav">
              <Link to="/tasks" className="nav-link">
                Tasks
              </Link>
              <Link to="/add-edit" className="nav-link">
                Add/Edit Task
              </Link>
            </nav>
            <div className="auth-controls">
              {user ? (
                <div className="user-profile">
                  {user.picture ? <img src={user.picture} alt="Profile" className="user-avatar" /> : null}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{user.email}</div>
                  </div>
                  <button className="theme-toggle-button" onClick={handleSignOut} style={{ minWidth: 'auto' }}>
                    Sign out
                  </button>
                </div>
              ) : (
                <div>
                  <div id="google-signin-btn" />
                  {authUiError ? (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--danger)' }}>
                      {authUiError}
                    </p>
                  ) : null}
                </div>
              )}
              <button className="theme-toggle-button" onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}>
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </button>
            </div>
          </div>

          <Routes>
            <Route path="/" element={<ListTasksComponent isAuthenticated={Boolean(user)} userId={user?.id} authToken={authToken} refreshTasks={refreshTasks} />} />
            <Route path="/tasks" element={<ListTasksComponent isAuthenticated={Boolean(user)} userId={user?.id} authToken={authToken} refreshTasks={refreshTasks} />} />
            <Route path="/add-edit" element={<AddEditTask isAuthenticated={Boolean(user)} userId={user?.id} authToken={authToken} />} />
            <Route path="/add-edit/:id" element={<AddEditTask isAuthenticated={Boolean(user)} userId={user?.id} authToken={authToken} />} />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </Routes>
        </header>
      </div>
    </BrowserRouter>
  );
}

export default App;
