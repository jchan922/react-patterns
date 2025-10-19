# React 19 - Custom Hooks

## What Are Custom Hooks?

Custom hooks are **reusable functions** that use React's built-in hooks (useState, useEffect, useContext, etc.) to encapsulate and share logic between components.

**In modern React 19, custom hooks are the preferred pattern for sharing logic**, replacing older patterns like Higher-Order Components (HOCs) for most use cases.

### Rules of Custom Hooks

1. ✅ **Must start with "use"** (e.g., `useFetch`, `useAuth`, `useLocalStorage`)
2. ✅ **Can call other hooks** (built-in or custom)
3. ✅ **Follow all Rules of Hooks** (top-level only, React functions only)
4. ✅ **Can return anything** (values, functions, objects, arrays)

---

## Custom Hooks vs Higher-Order Components (HOCs)

**TL;DR**: Default to custom hooks. Only use HOCs for conditional rendering or component tree manipulation.

### Why Custom Hooks Are Preferred

| Aspect              | Custom Hooks ✅                      | HOCs ❌                             |
| ------------------- | ------------------------------------ | ----------------------------------- |
| **Transparency**    | Clear API - you see what goes in/out | Hidden props - unclear what's added |
| **Prop Collisions** | None - direct value access           | Risk of name conflicts              |
| **Nesting**         | No wrapper hell                      | Multiple HOCs = deep nesting        |
| **Debugging**       | Simple call stack                    | Complex wrapper chain               |
| **Composition**     | Easy to combine multiple hooks       | Difficult to compose HOCs           |
| **TypeScript**      | Excellent type inference             | Requires complex generics           |

### Example Comparison

```javascript
// ❌ OLD WAY: HOC Pattern (avoid for most cases)
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // ... auth logic
    return <Component {...props} isAuthenticated={isAuthenticated} />;
  };
}

export default withAuth(Dashboard); // Wrapper indirection

// ✅ NEW WAY: Custom Hook Pattern (preferred)
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const login = useCallback(() => setIsAuthenticated(true), []);
  const logout = useCallback(() => setIsAuthenticated(false), []);
  return { isAuthenticated, login, logout };
}

// Usage - Clean and explicit
function Dashboard() {
  const { isAuthenticated, login, logout } = useAuth();
  // Everything is visible and clear
  if (!isAuthenticated) return <LoginScreen onLogin={login} />;
  return <DashboardContent onLogout={logout} />;
}
```

### When HOCs Are Still Acceptable

HOCs have a few legitimate use cases:

1. **Conditional rendering** - Completely hide/show components based on feature flags
2. **Legacy code** - Working with class components that can't use hooks
3. **Third-party libraries** - When a library requires HOC pattern
4. **Component tree manipulation** - Programmatically wrapping with providers/boundaries

```javascript
// Acceptable HOC use case: Feature flags
function withFeatureFlag(Component, featureName) {
  return function FeatureFlaggedComponent(props) {
    const { flags } = useFeatureFlags();
    if (!flags[featureName]) return null; // Hide entirely
    return <Component {...props} />;
  };
}

export default withFeatureFlag(BetaFeature, "new-dashboard");
```

---

## When to Use Custom Hooks

### ✅ Create a Custom Hook When:

- **Duplicated logic** across multiple components
- **Complex stateful logic** that's hard to read inline
- **Side effects** that are reused (API calls, subscriptions, timers)
- **Multiple related state values** that are always used together
- **Integration with browser APIs** (localStorage, event listeners, media queries)

### ❌ Don't Create a Custom Hook When:

- Logic is only used once
- It's just a utility function (doesn't use hooks)
- It's simpler to keep inline

---

## The 4 Essential Custom Hook Patterns

These four patterns cover 90% of custom hook use cases. Each represents a fundamentally different pattern of logic reuse.

---

## Pattern 1: Data Fetching Hook (Side Effect Management)

**Core Pattern:** Managing async operations with loading/error states

**Why it's essential:** Nearly every app fetches data. This pattern handles the complexity of async operations, race conditions, and state management.

```javascript
import { useState, useEffect, useRef } from "react";

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track if we should update state (prevents memory leaks)
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Reset mounted state on mount
    isMountedRef.current = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setData(json);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    if (url) {
      fetchData();
    }

    // Cleanup: mark component as unmounted
    return () => {
      isMountedRef.current = false;
    };
  }, [url]); // Re-fetch when URL changes

  // Refetch function for manual refresh
  const refetch = () => {
    setLoading(true);
    setError(null);
  };

  return { data, loading, error, refetch };
}

// Usage Example 1: Simple GET request
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Usage Example 2: Multiple fetches in one component
function Dashboard() {
  const { data: users, loading: usersLoading } = useFetch("/api/users");
  const { data: posts, loading: postsLoading } = useFetch("/api/posts");
  const { data: stats } = useFetch("/api/stats");

  const isLoading = usersLoading || postsLoading;

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2>Users: {users?.length}</h2>
      <h2>Posts: {posts?.length}</h2>
      <h2>Total Views: {stats?.views}</h2>
    </div>
  );
}

// Usage Example 3: With manual refetch
function ProductList() {
  const { data: products, loading, refetch } = useFetch("/api/products");

  return (
    <div>
      <button onClick={refetch} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      {products?.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

**Pattern Logic:**

- Manages three related states (data, loading, error)
- Handles cleanup to prevent memory leaks
- Responds to dependency changes (URL)
- Provides manual control (refetch)

---

## Pattern 2: Stateful Value Persistence (Browser API Integration)

**Core Pattern:** Syncing React state with external storage/APIs

**Why it's essential:** Combines useState with external APIs (localStorage, sessionStorage, IndexedDB, etc.). This pattern is about keeping React state synchronized with non-React systems.

```javascript
import { useState, useEffect } from "react";

function useLocalStorage(key, initialValue) {
  // Initialize state from localStorage or use default
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing storage event:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setStoredValue];
}

// Usage Example 1: Theme persistence
function App() {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  return (
    <div className={`app theme-${theme}`}>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle Theme ({theme})
      </button>
    </div>
  );
}

// Usage Example 2: Shopping cart
function ShoppingCart() {
  const [cart, setCart] = useLocalStorage("cart", []);

  const addItem = (item) => {
    setCart([...cart, item]);
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div>
      <h2>Cart ({cart.length} items)</h2>
      {cart.map((item) => (
        <div key={item.id}>
          {item.name} - ${item.price}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      <button onClick={clearCart}>Clear Cart</button>
    </div>
  );
}

// Usage Example 3: Form draft auto-save
function BlogEditor() {
  const [draft, setDraft] = useLocalStorage("blog-draft", {
    title: "",
    content: "",
    lastSaved: null,
  });

  const handleChange = (field, value) => {
    setDraft({
      ...draft,
      [field]: value,
      lastSaved: new Date().toISOString(),
    });
  };

  return (
    <div>
      <input
        value={draft.title}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="Title"
      />
      <textarea
        value={draft.content}
        onChange={(e) => handleChange("content", e.target.value)}
        placeholder="Content"
      />
      {draft.lastSaved && (
        <small>Last saved: {new Date(draft.lastSaved).toLocaleString()}</small>
      )}
    </div>
  );
}
```

**Pattern Logic:**

- Synchronizes React state with external storage
- Handles SSR/hydration (checks for window)
- Listens for external changes (cross-tab sync)
- Manages serialization/deserialization
- Provides error handling for storage failures

---

## Pattern 3: Event-Driven State (DOM Event Listeners)

**Core Pattern:** Managing event listeners and derived state from events

**Why it's essential:** Represents the pattern of subscribing to events, cleaning up, and deriving state. Used for window resize, scroll, mouse position, keyboard shortcuts, etc.

```javascript
import { useState, useEffect, useRef } from "react";

function useEventListener(eventName, handler, element = window) {
  // Store handler in ref to avoid re-subscribing on every render
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Make sure element supports addEventListener
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    // Create event listener that calls handler function stored in ref
    const eventListener = (event) => savedHandler.current(event);

    element.addEventListener(eventName, eventListener);

    // Remove event listener on cleanup
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// Derived Hook 1: Window Size
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEventListener("resize", () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  });

  // Set initial size
  useEffect(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  return windowSize;
}

// Derived Hook 2: Media Query
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e) => setMatches(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// Derived Hook 3: Click Outside
function useClickOutside(handler) {
  const ref = useRef(null);

  useEventListener(
    "mousedown",
    (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    },
    document
  );

  return ref;
}

// Usage Example 1: Responsive layout
function ResponsiveComponent() {
  const { width } = useWindowSize();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      <p>Window width: {width}px</p>
    </div>
  );
}

// Usage Example 2: Fullscreen canvas
function FullscreenCanvas() {
  const { width, height } = useWindowSize();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      // Draw something based on current size
      ctx.fillRect(0, 0, width, height);
    }
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block" }}
    />
  );
}

// Usage Example 3: Dropdown menu
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));

  return (
    <div ref={dropdownRef} className="dropdown">
      <button onClick={() => setIsOpen(!isOpen)}>
        Menu {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <ul className="dropdown-menu">
          <li>Profile</li>
          <li>Settings</li>
          <li>Logout</li>
        </ul>
      )}
    </div>
  );
}

// Usage Example 4: Keyboard shortcuts
function App() {
  useEventListener("keydown", (e) => {
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      console.log("Open search!");
    }

    // Escape to close modals
    if (e.key === "Escape") {
      console.log("Close modal!");
    }
  });

  return <div>Press Cmd+K or Escape</div>;
}
```

**Pattern Logic:**

- Subscribes to events with proper cleanup
- Stores handler in ref to avoid re-subscription
- Derives state from events
- Provides foundation for other hooks (composition)
- Handles element-specific listeners (window, document, custom elements)

---

## Pattern 4: Delayed Execution (Timing & Throttling)

**Core Pattern:** Delaying execution until conditions are met or debouncing rapid changes

**Why it's essential:** Critical for performance. Prevents excessive API calls, re-renders, or computations. Used in search, auto-save, infinite scroll, etc.

```javascript
import { useState, useEffect, useRef } from "react";

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout if value changes before delay completes
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Alternative: Debounced callback (different pattern)
function useDebouncedCallback(callback, delay = 500) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

// Usage Example 1: Search with debounce
function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Only search when debounced value changes
  useEffect(() => {
    if (!debouncedSearch) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    fetch(`/api/search?q=${debouncedSearch}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setIsSearching(false);
      });
  }, [debouncedSearch]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />

      {searchTerm && !debouncedSearch && <p>Typing...</p>}

      {isSearching && <p>Searching...</p>}

      <ul>
        {results.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Usage Example 2: Auto-save draft
function DraftEditor() {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (debouncedContent) {
      // Save to backend
      fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: debouncedContent }),
      }).then(() => {
        setLastSaved(new Date());
      });
    }
  }, [debouncedContent]);

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write something..."
        rows="10"
      />
      {lastSaved && (
        <small>Auto-saved at {lastSaved.toLocaleTimeString()}</small>
      )}
    </div>
  );
}

// Usage Example 3: Window resize handler (debounced callback)
function ResponsiveChart() {
  const [chartWidth, setChartWidth] = useState(window.innerWidth);

  const handleResize = useDebouncedCallback(() => {
    setChartWidth(window.innerWidth);
    console.log("Chart resized to:", window.innerWidth);
  }, 250);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div>
      <Chart width={chartWidth} />
    </div>
  );
}

// Usage Example 4: Form validation (prevent excessive validation)
function SignupForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const debouncedEmail = useDebounce(email, 500);

  useEffect(() => {
    if (!debouncedEmail) {
      setEmailError("");
      return;
    }

    // Validate email format
    if (!debouncedEmail.includes("@")) {
      setEmailError("Invalid email format");
      return;
    }

    // Check if email exists (API call)
    fetch(`/api/check-email?email=${debouncedEmail}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.exists) {
          setEmailError("Email already exists");
        } else {
          setEmailError("");
        }
      });
  }, [debouncedEmail]);

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {emailError && <span className="error">{emailError}</span>}
    </form>
  );
}
```

**Pattern Logic:**

- Delays state updates until user stops interacting
- Uses setTimeout with cleanup
- Two variations: debounced value vs debounced callback
- Prevents excessive function calls
- Critical for performance optimization

---

## Composing Hooks Together

**Real-world example:** Search component using multiple patterns

```javascript
function useSearch(endpoint) {
  // Pattern 4: Debounce user input
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  // Pattern 1: Fetch data
  const url = debouncedQuery ? `${endpoint}?q=${debouncedQuery}` : null;
  const { data, loading, error } = useFetch(url);

  // Pattern 2: Save recent searches to localStorage
  const [recentSearches, setRecentSearches] = useLocalStorage(
    "recent-searches",
    []
  );

  useEffect(() => {
    if (debouncedQuery && data) {
      // Add to recent searches (keep last 5)
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s !== debouncedQuery);
        return [debouncedQuery, ...filtered].slice(0, 5);
      });
    }
  }, [debouncedQuery, data, setRecentSearches]);

  return {
    query,
    setQuery,
    results: data,
    loading,
    error,
    recentSearches,
  };
}

// Usage - Simple API
function SearchPage() {
  const { query, setQuery, results, loading, recentSearches } =
    useSearch("/api/search");

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      {loading && <p>Searching...</p>}

      {!query && recentSearches.length > 0 && (
        <div>
          <h3>Recent Searches</h3>
          {recentSearches.map((search) => (
            <button key={search} onClick={() => setQuery(search)}>
              {search}
            </button>
          ))}
        </div>
      )}

      <ul>
        {results?.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Best Practices for Custom Hooks

### ✅ Do's

1. **Start with "use"** - Required by React's linting rules
2. **Return what's needed** - Don't expose internal implementation
3. **Handle cleanup** - Always cleanup side effects in useEffect
4. **Use refs for non-state values** - Avoid unnecessary re-renders
5. **Accept configuration** - Make hooks flexible with options
6. **Document your hooks** - JSDoc comments help

### ❌ Don'ts

1. **Don't call conditionally** - Hooks must be called in same order every render
2. **Don't over-abstract** - If it's only used once, keep it in the component
3. **Don't forget dependencies** - ESLint will catch this, but be aware
4. **Don't return too much** - Keep the API minimal and focused

---

## Summary

These four patterns cover the vast majority of custom hook use cases:

1. **useFetch** - Side effect management (async operations, loading/error states)
2. **useLocalStorage** - Browser API integration (syncing external state)
3. **useEventListener** - Event subscription (DOM events, cleanup)
4. **useDebounce** - Timing & performance (delayed execution)

---

## Bonus Pattern: Authentication Hook

A complete example from the demo application showing authentication state management.

```javascript
import { useState, useCallback } from "react";

// Custom hook for authentication
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  }, []);

  return { isAuthenticated, login, logout };
}

// Usage in App component
function App() {
  const { isAuthenticated, login, logout } = useAuth();
  const [debugEvents, setDebugEvents] = useState([]);

  const handleLogin = () => {
    console.log("User logged in");
    login();
  };

  const handleLogout = () => {
    console.log("User logged out");
    logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <h2>Welcome to Todo App</h2>
        <button onClick={handleLogin}>Log In</button>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      {/* App content */}
    </div>
  );
}
```

**Why this pattern works**:

- Combines Pattern 2 (localStorage) with authentication logic
- Clean, testable API
- Easy to extend with more auth features (token refresh, permissions, etc.)
- No HOC wrapper complexity
