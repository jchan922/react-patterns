import { useState, useEffect, useCallback, useRef } from 'react';
import { mockApi } from './api/mockApi';
import { useAuth } from './hooks/useAuth';
import TodoList from './components/TodoList';
import ThemeToggle from './components/ThemeToggle';
import DebugPanel from './components/DebugPanel';
import './styles/app.scss';

function App() {
  // Custom hook pattern (modern React) - replaces HOC pattern
  const { isAuthenticated, login, logout } = useAuth();
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [debugEvents, setDebugEvents] = useState([]);

  // Track render count for performance monitoring
  const renderCount = useRef(0);

  // DOM reference for programmatic focus control
  const listInputRef = useRef(null);

  // Increment on every render (doesn't trigger re-render)
  renderCount.current += 1;

  const logEvent = useCallback((type, message, hooks = []) => {
    // Functional update pattern: uses prev state to avoid stale closures
    setDebugEvents(prev => [...prev, {
      type,
      message,
      timestamp: Date.now(),
      hooks
    }]);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      // OPTIMIZATION: Batch all events together to reduce re-renders
      // Instead of multiple setDebugEvents calls, collect events in array
      // and update state once at the end
      const events = [];

      // Track page load event
      events.push({
        type: 'page-load',
        message: `App mounted - ${isAuthenticated ? 'authenticated' : 'not authenticated'}`,
        timestamp: Date.now(),
        hooks: [
          'useEffect → deps: [isAuthenticated]',
          'prop → isAuthenticated'
        ]
      });

      // Only fetch data if user is authenticated
      if (isAuthenticated) {
        try {
          // Mock async API call (500ms delay)
          const data = await mockApi.getAllLists();
          setLists(data);

          events.push({
            type: 'page-load',
            message: `Loaded ${data.length} existing lists`,
            timestamp: Date.now(),
            hooks: [
              'useEffect → deps: [isAuthenticated]',
              'useState → setLists(data)',
              'async/await → mockApi.getAllLists()'
            ]
          });
        } catch (error) {
          console.error('Failed to fetch lists:', error);
          events.push({
            type: 'page-load',
            message: 'Failed to load lists',
            timestamp: Date.now(),
            hooks: [
              'useEffect → deps: [isAuthenticated]',
              'async/await → mockApi.getAllLists()'
            ]
          });
        }
      }

      // Single state update with all events (optimization)
      setDebugEvents(prev => [...prev, ...events]);
    };

    initializeApp();
  }, [isAuthenticated]); // Note: logEvent omitted from deps (stable reference)

  const handleCreateList = useCallback(async (e) => {
    e.preventDefault();

    // Validation: Don't create empty lists
    if (!newListTitle.trim()) {
      // Use ref to focus input without triggering re-render
      listInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    logEvent('list-create', `Creating list: "${newListTitle}"`, [
      'useCallback → handleCreateList',
      'useState → setIsLoading(true)',
      'state → newListTitle'
    ]);

    try {
      // Async API call to create list
      const newList = await mockApi.createList(newListTitle);

      // PATTERN: Functional update to avoid stale closure
      // Use prev => [...prev, newItem] instead of [...lists, newItem]
      setLists(prev => [...prev, newList]);

      // Reset form
      setNewListTitle('');

      // Auto-focus for better UX (using ref, not state)
      listInputRef.current?.focus();

      logEvent('list-create', `List created successfully: "${newList.title}"`, [
        'useCallback → handleCreateList',
        'useState → setLists(prev => [...prev, newList])',
        'useState → setNewListTitle("")',
        'useRef → listInputRef.current.focus()',
        'async/await → mockApi.createList()'
      ]);
    } catch (error) {
      console.error('Failed to create list:', error);
      logEvent('list-create', 'Failed to create list', [
        'useCallback → handleCreateList',
        'async/await → mockApi.createList() [error]'
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [newListTitle, logEvent]);

  // Handler: Delete todo list
  // deps: [lists, logEvent] - needs lists to find title for logging
  const handleDeleteList = useCallback(async (id) => {
    const listToDelete = lists.find(l => l.id === id);

    logEvent('list-delete', `Deleting list: "${listToDelete?.title}"`, [
      'useCallback → handleDeleteList',
      'param → id',
      'state → lists'
    ]);

    try {
      // Async API call to delete list
      await mockApi.deleteList(id);

      // PATTERN: Functional update with filter
      setLists(prev => prev.filter(list => list.id !== id));

      logEvent('list-delete', `List deleted: "${listToDelete?.title}"`, [
        'useCallback → handleDeleteList',
        'useState → setLists(prev => prev.filter())',
        'async/await → mockApi.deleteList(id)'
      ]);
    } catch (error) {
      console.error('Failed to delete list:', error);
      logEvent('list-delete', 'Failed to delete list', [
        'useCallback → handleDeleteList',
        'async/await → mockApi.deleteList() [error]'
      ]);
    }
  }, [lists, logEvent]);

  // Handler: Toggle debug panel open/close
  // deps: [logEvent] - only needs logEvent
  const handleDebugToggle = useCallback(() => {
    // PATTERN: Functional update when new state depends on previous state
    setIsDebugOpen(prev => {
      const newState = !prev;
      logEvent('debug', newState ? 'Debug panel opened' : 'Debug panel closed', [
        'useCallback → handleDebugToggle',
        'useState → setIsDebugOpen(!prev)'
      ]);
      return newState;
    });
  }, [logEvent]);

  // Handler: User login (from useAuth hook)
  // deps: [logEvent, login] - login comes from useAuth custom hook
  const handleLogin = useCallback(() => {
    logEvent('auth', 'User logged in', [
      'useCallback → handleLogin',
      'custom hook → useAuth()',
      'hook function → login()'
    ]);
    login();
  }, [logEvent, login]);

  // Handler: User logout (from useAuth hook)
  // deps: [logEvent, logout] - logout comes from useAuth custom hook
  const handleLogout = useCallback(() => {
    logEvent('auth', 'User logged out', [
      'useCallback → handleLogout',
      'custom hook → useAuth()',
      'hook function → logout()'
    ]);
    logout();
  }, [logEvent, logout]);

  if (!isAuthenticated) {
    return (
      <>
        <div className="login-screen">
          {/* Debug button visible even when logged out */}
          <button
            onClick={handleDebugToggle}
            className="btn-debug debug-floating"
            aria-label="Toggle debug panel"
          >
            🐛
          </button>

          <div className="login-card">
            <h2>Welcome to Todo App</h2>
            <p>Please log in to continue</p>
            <button onClick={handleLogin} className="btn-primary">
              Log In
            </button>
          </div>
        </div>

        {/* Debug panel available on login screen to track page load events */}
        <DebugPanel
          isOpen={isDebugOpen}
          onClose={() => setIsDebugOpen(false)}
          renderCount={renderCount.current}
          events={debugEvents}
        />
      </>
    );
  }

  return (
    <div className="app">
      {/* ===== HEADER ===== */}
      <header className="app-header">
        <div className="header-content">
          <h1>React 19 Todo App</h1>
          <div className="header-actions">
            {/* ThemeToggle: Uses useContext to access ThemeContext */}
            <ThemeToggle logEvent={logEvent} />

            {/* Debug panel toggle */}
            <button
              onClick={handleDebugToggle}
              className="btn-debug"
              aria-label="Toggle debug panel"
            >
              🐛
            </button>

            {/* Logout: Calls HOC's logout function */}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>

        {/* Performance monitoring: Shows render count from useRef */}
        <p className="render-info">
          Component rendered: {renderCount.current} times
        </p>
      </header>

      {/* ===== DEBUG PANEL (slide-in from right) ===== */}
      <DebugPanel
        isOpen={isDebugOpen}
        onClose={() => setIsDebugOpen(false)}
        renderCount={renderCount.current}
        events={debugEvents}
      />

      {/* ===== MAIN CONTENT ===== */}
      <main className="app-main">
        {/* Create new list form */}
        <section className="create-list-section">
          <form onSubmit={handleCreateList} className="create-list-form">
            {/* PATTERN: useRef for DOM access without re-renders */}
            <input
              ref={listInputRef}
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Enter list title..."
              className="list-input"
              disabled={isLoading}
            />
            <button type="submit" className="btn-create" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create List'}
            </button>
          </form>
        </section>

        {/* Lists container - conditional rendering */}
        <section className="lists-container">
          {lists.length === 0 ? (
            // Empty state
            <div className="empty-state-large">
              <h2>No lists yet</h2>
              <p>Create your first todo list above!</p>
            </div>
          ) : (
            // PATTERN: List rendering with unique keys
            <div className="lists-grid">
              {lists.map(list => (
                <TodoList
                  key={list.id}
                  list={list}
                  onDelete={handleDeleteList}
                  logEvent={logEvent}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="app-footer">
        <p>Built with React 19 • Demonstrates: Hooks, Context, Custom Hooks, Memoization</p>
      </footer>
    </div>
  );
}

export default App;
