# React 19 - Components - Client-Side

## Modern React: Functional Components + Hooks Only

**Important:** Class components are legacy. In 2025, everything is **functional components with hooks**.

```javascript
// ❌ OLD (Class Component - Don't use anymore)
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return (
      <button onClick={() => this.setState({ count: this.state.count + 1 })}>
        {this.state.count}
      </button>
    );
  }
}

// ✅ NEW (Functional Component with Hooks)
function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## 1. Simple Component with Props

**Render Props Pattern** - passing JSX/components as props.

```javascript
"use client"; // If using Next.js App Router
import { Star } from "lucide-react";

// Simple presentational component
function Card({ title, children, icon, variant = "default" }) {
  return (
    <div className={`card card-${variant}`}>
      {icon && <div className="card-icon">{icon}</div>}
      <h3>{title}</h3>
      <div className="card-content">{children}</div>
    </div>
  );
}

// Usage
function App() {
  return (
    <Card title="Featured Product" icon={<Star />} variant="primary">
      <p>This is the card content</p>
      <button>Learn More</button>
    </Card>
  );
}

export default Card;
```

**Best Practices 2025:**

- ✅ Use destructuring for props
- ✅ Provide default values for optional props
- ✅ Keep components pure (same props = same output)
- ✅ Use TypeScript for better prop validation (optional but recommended)

---

## 2. Component with State

**Real-world example:** Todo item with expand/collapse state.

```javascript
"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

function TodoItem({ todo, onDelete, onToggle }) {
  // ✅ useState - UI needs to re-render when expanded changes
  const [isExpanded, setIsExpanded] = useState(false);

  // ❌ WRONG: Don't use useState for hover state
  // const [isHovered, setIsHovered] = useState(false);

  // ✅ Better: Use CSS :hover instead (no JS needed!)
  // Or if you need the value in JS, but DON'T need re-render, use useRef

  return (
    <div className="todo-item">
      <div className="todo-header">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className={todo.completed ? "completed" : ""}>{todo.title}</span>

        {/* Show/hide with CSS :hover instead of state */}
        <button className="delete-btn" onClick={() => onDelete(todo.id)}>
          <Trash2 size={16} />
        </button>

        {todo.description && (
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </button>
        )}
      </div>

      {isExpanded && todo.description && (
        <p className="todo-description">{todo.description}</p>
      )}
    </div>
  );
}

/* CSS for hover effect - no state needed! */
// .delete-btn { opacity: 0; }
// .todo-item:hover .delete-btn { opacity: 1; }

export default TodoItem;
```

**Best Practices 2025:**

- ✅ Multiple `useState` for independent state
- ✅ Name boolean state with `is/has/should` prefix
- ✅ Keep state as close to where it's used as possible
- ✅ Use callback functions in event handlers
- ✅ **Use CSS for visual-only changes (hover, focus) instead of state**
- ✅ **Only use state if the UI needs to re-render**

---

## 3. Parent-Child with Props Passing

**Real-world example:** Product list with individual product cards.

```javascript
"use client";
import { useState } from "react";

// Child Component
function ProductCard({ product, onAddToCart, isInCart }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">${product.price}</p>
      <p className="description">{product.description}</p>

      <button onClick={() => onAddToCart(product)} disabled={isInCart}>
        {isInCart ? "In Cart" : "Add to Cart"}
      </button>
    </div>
  );
}

// Parent Component
function ProductList({ products }) {
  const [cart, setCart] = useState([]);

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
  };

  const isProductInCart = (productId) => {
    return cart.some((item) => item.id === productId);
  };

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          isInCart={isProductInCart(product.id)}
        />
      ))}

      <div className="cart-summary">Cart: {cart.length} items</div>
    </div>
  );
}

export default ProductList;
```

**Best Practices 2025:**

- ✅ Always use `key` prop in lists (unique, stable IDs)
- ✅ Lift state up to the common parent
- ✅ Pass callbacks down (props down, events up)
- ✅ Use functional updates when new state depends on old: `setCart(prev => [...prev, item])`

---

## 4. Context for State Sharing Between Siblings

**Real-world example:** Theme switcher accessible from multiple components.

```javascript
"use client";
import { createContext, useContext, useState } from "react";

// 1. Create Context
const ThemeContext = createContext(null);

// 2. Create Provider Component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState("medium");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    fontSize,
    setFontSize,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`app theme-${theme} font-${fontSize}`}>{children}</div>
    </ThemeContext.Provider>
  );
}

// 3. Custom Hook for easy access
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// 4. Sibling Component 1 - Header
function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header>
      <h1>My App</h1>
      <button onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
    </header>
  );
}

// 5. Sibling Component 2 - Settings
function Settings() {
  const { fontSize, setFontSize, theme } = useTheme();

  return (
    <aside className="settings">
      <h2>Settings</h2>
      <p>Current theme: {theme}</p>

      <label>
        Font Size:
        <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </label>
    </aside>
  );
}

// 6. Sibling Component 3 - Content
function Content() {
  const { theme } = useTheme();

  return (
    <main>
      <p>The current theme is {theme}</p>
    </main>
  );
}

// 7. App with Provider
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Content />
      <Settings />
    </ThemeProvider>
  );
}

export default App;
```

**Best Practices 2025:**

- ✅ Create custom hook (`useTheme`) for cleaner access
- ✅ Add error boundary check in custom hook
- ✅ Split large contexts (don't put everything in one context)
- ✅ Keep provider close to where it's needed (not always at root)
- ✅ Memoize context value if it causes re-render issues

---

## 5. Form Handling (Modern Approach)

**Real-world example:** Contact form with validation.

```javascript
"use client";
import { useState } from "react";

function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    subscribe: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    return newErrors;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Form submission logic here (see next section)
      console.log("Form data:", formData);

      // Success - reset form
      setFormData({ name: "", email: "", message: "", subscribe: false });
      alert("Form submitted successfully!");
    } catch (error) {
      setErrors({ submit: "Failed to submit form. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? "error" : ""}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "error" : ""}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          className={errors.message ? "error" : ""}
        />
        {errors.message && <span className="error-text">{errors.message}</span>}
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleChange}
          />
          Subscribe to newsletter
        </label>
      </div>

      {errors.submit && <div className="error-text">{errors.submit}</div>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default ContactForm;
```

**Best Practices 2025:**

- ✅ Use controlled components (value + onChange)
- ✅ Store all form data in single state object
- ✅ Use computed `name` attribute with `e.target.name`
- ✅ Validate on submit, clear errors on change
- ✅ Show loading state during submission
- ✅ Use `htmlFor` on labels (not `for`)

---

## 6. API Calls in Forms (with Error Handling)

**Real-world example:** Login form with API integration.

```javascript
"use client";
import { useState } from "react";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      setStatus("success");

      // Store token (or use your auth solution)
      localStorage.setItem("token", data.token);

      // Redirect or update app state
      window.location.href = "/dashboard";
    } catch (err) {
      setStatus("error");
      setError(err.message || "An error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </div>

      {status === "error" && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {status === "success" && (
        <div className="alert alert-success" role="alert">
          Login successful! Redirecting...
        </div>
      )}

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
```

**Alternative: Using React 19's `useActionState` (Modern)**

```javascript
"use client";
import { useActionState } from "react";

// Server Action (if using Next.js)
async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return { success: true, token: data.token };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}

function ModernLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction}>
      <h2>Login</h2>

      <input name="email" type="email" placeholder="Email" required />

      <input name="password" type="password" placeholder="Password" required />

      {state?.error && <div className="alert alert-error">{state.error}</div>}

      {state?.success && (
        <div className="alert alert-success">Login successful!</div>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default ModernLoginForm;
```

**API Call Best Practices 2025:**

- ✅ Use try/catch for error handling
- ✅ Check `response.ok` before parsing JSON
- ✅ Show loading state (`isPending` or custom state)
- ✅ Use `async/await` instead of `.then()`
- ✅ Consider using libraries: TanStack Query, SWR, or React 19's `useActionState`
- ✅ Handle network errors separately from API errors
- ✅ Never store sensitive data in localStorage (use httpOnly cookies)

---

## 7. Other Advanced Patterns

### Pattern 1: Custom Hooks (Reusable Logic)
See [custom-hooks.md](/react-19/custom-hooks.md)

### Pattern 2: Compound Components

```javascript
// Parent manages state, children access through context
const TabsContext = createContext(null);

function Tabs({ children, defaultTab = 0 }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list">{children}</div>;
}

function Tab({ index, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);

  return (
    <button
      className={activeTab === index ? "active" : ""}
      onClick={() => setActiveTab(index)}
    >
      {children}
    </button>
  );
}

function TabPanel({ index, children }) {
  const { activeTab } = useContext(TabsContext);

  return activeTab === index ? <div>{children}</div> : null;
}

// Usage
<Tabs defaultTab={0}>
  <TabList>
    <Tab index={0}>Profile</Tab>
    <Tab index={1}>Settings</Tab>
    <Tab index={2}>Billing</Tab>
  </TabList>

  <TabPanel index={0}>Profile content</TabPanel>
  <TabPanel index={1}>Settings content</TabPanel>
  <TabPanel index={2}>Billing content</TabPanel>
</Tabs>;
```

### Pattern 3: Higher-Order Component (Legacy, but still used)

```javascript
// HOC for authentication
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Check authentication
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
      } else {
        // Fetch user data
        fetchUser(token)
          .then(setUser)
          .finally(() => setLoading(false));
      }
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!user) return null;

    return <Component {...props} user={user} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
```

**Note:** HOCs are legacy. Modern approach: use custom hooks instead.

### Pattern 4: Render Props (Less common now, but still valid)

```javascript
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return render(position);
}

// Usage
<MouseTracker
  render={({ x, y }) => (
    <div>
      Mouse position: {x}, {y}
    </div>
  )}
/>;
```

**Note:** Custom hooks are now preferred over render props.

### Pattern 5: Portal (Modals, Tooltips)

```javascript
import { useState } from "react";
import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>,
    document.body // Renders outside root div
  );
}

// Usage
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Modal Content</h2>
        <p>This renders outside the root DOM tree!</p>
      </Modal>
    </>
  );
}
```

### Pattern 6: Error Boundaries (Class component - only way)

```javascript
// Still requires class component (no hook alternative yet)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>;
```

### Pattern 7: Lazy Loading & Code Splitting

```javascript
import { lazy, Suspense } from "react";

// Lazy load component
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <div>
      <h1>My App</h1>

      <Suspense fallback={<div>Loading component...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

### Pattern 8: Debouncing User Input

```javascript
"use client";
import { useState, useRef, useEffect } from "react";

function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // ✅ useRef - timer ID doesn't need to trigger re-renders
  const timerRef = useRef(null);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Debounce: wait 500ms after user stops typing
    timerRef.current = setTimeout(() => {
      if (query) {
        fetch(`/api/search?q=${query}`)
          .then((res) => res.json())
          .then(setResults);
      } else {
        setResults([]);
      }
    }, 500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Why useRef here?** Timer IDs don't need to trigger re-renders. We just need to remember them for cleanup.

---

## Summary: Modern React in 2025

✅ **Always use functional components** (classes are legacy)  
✅ **Use hooks** for state, effects, context, etc.  
✅ **Use `'use client'`** directive when needed (Next.js App Router)  
✅ **Prefer custom hooks** over HOCs and render props  
✅ **Keep components small and focused**  
✅ **Lift state up** when sharing between components  
✅ **Use Context** for deeply nested props  
✅ **Use `useActionState`** for forms in React 19  
✅ **Always add `key` prop** in lists  
✅ **Handle loading and error states** in API calls  
✅ **Use `async/await`** instead of promises chains

### 🎯 useState vs useRef Decision Guide

**Use `useState` when:**

- ✅ The value change should trigger a re-render
- ✅ The value is displayed in the UI
- ✅ Examples: form inputs, toggles, counters, lists

**Use `useRef` when:**

- ✅ You need to persist a value between renders WITHOUT re-rendering
- ✅ Storing DOM references
- ✅ Storing timer/interval IDs
- ✅ Storing previous values
- ✅ Tracking if component is mounted
- ✅ Examples: `setTimeout` IDs, animation frame IDs, previous prop values

**Use CSS instead of state when:**

- ✅ Visual-only changes (hover, focus, active states)
- ✅ Simple animations
- ✅ Transitions

```javascript
// ❌ BAD - Unnecessary state
const [isHovered, setIsHovered] = useState(false);
<div onMouseEnter={() => setIsHovered(true)}>
  {isHovered && <span>👋</span>}
</div>

// ✅ GOOD - Use CSS
<div className="item">
  <span className="wave">👋</span>
</div>
// CSS: .wave { display: none; }
//      .item:hover .wave { display: inline; }

// ✅ ALSO GOOD - If you need the value but not re-render
const isHoveredRef = useRef(false);
<div
  onMouseEnter={() => {
    isHoveredRef.current = true;
    console.log('Hovered!'); // No re-render!
  }}
>
```
