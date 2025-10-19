# React 19 Coding Standards

This document provides comprehensive coding standards and best practices for React 19 development. It serves as a reference guide for developers, LLMs, and AI agents working with React 19 codebases.

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [React 19 Features & Hooks](#react-19-features--hooks)
3. [Server Components & Directives](#server-components--directives)
4. [State Management](#state-management)
5. [Performance Optimization](#performance-optimization)
6. [TypeScript Integration](#typescript-integration)
7. [File Organization](#file-organization)
8. [Naming Conventions](#naming-conventions)
9. [Testing Standards](#testing-standards)
10. [Code Quality & Tooling](#code-quality--tooling)

---

## Component Architecture

### Functional Components Only

**Standard**: Use functional components exclusively. Class components are deprecated in modern React development.

```jsx
// Good
function UserProfile({ name, email }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// Avoid
class UserProfile extends React.Component {
  render() {
    return <div>...</div>;
  }
}
```

### Component Declaration

**Standard**: Use named function declarations or arrow functions with memo when needed.

```jsx
// Preferred: Named function with memo
const TodoForm = memo(function TodoForm({ onAdd, isLoading }) {
  // Component logic
});

// Alternative: Arrow function for simple components
const Header = ({ title }) => <h1>{title}</h1>;

export default TodoForm;
```

### Custom Hooks vs Higher-Order Components (HOCs)

**Standard**: **Custom hooks are the preferred pattern** for sharing logic in React 19. Use HOCs only for specific edge cases.

#### Custom Hooks (Preferred)

Custom hooks provide cleaner, more composable, and easier-to-test solutions for sharing logic.

```jsx
// Custom hook for authentication (PREFERRED)
function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
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

// Usage - Clean and explicit
function App() {
  const { isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return <Dashboard onLogout={logout} />;
}
```

**Why custom hooks are preferred**:

- ✅ **Transparent API** - Clear inputs and outputs
- ✅ **No prop drilling** - Direct access to values
- ✅ **No prop collisions** - Avoid naming conflicts
- ✅ **Better composition** - Combine multiple hooks easily
- ✅ **Easier to debug** - Simple call stack
- ✅ **Type-safe** - Better TypeScript support

#### Higher-Order Components (Use Sparingly)

HOCs are still valid for specific cases but should not be your default choice.

```jsx
// HOC for conditional rendering (ONLY when needed)
function withFeatureFlag(Component, featureName) {
  return function FeatureFlaggedComponent(props) {
    const { flags } = useFeatureFlags();

    if (!flags[featureName]) {
      return null; // Don't render if feature is disabled
    }

    return <Component {...props} />;
  };
}

// Usage
export default withFeatureFlag(NewDashboard, "new-dashboard-v2");
```

**When HOCs are still appropriate**:

- ✅ **Conditional component rendering** - Render component A vs B based on condition
- ✅ **Legacy code bridges** - Working with class components
- ✅ **Component tree manipulation** - Wrapping with providers/error boundaries programmatically
- ✅ **Third-party library wrappers** - When library requires HOC pattern

**Problems with HOCs (why hooks are better)**:

- ❌ **Prop confusion** - Hard to know which props come from HOC vs component
- ❌ **Wrapper hell** - Multiple HOCs create deep nesting
- ❌ **Indirection** - Logic is separated from usage
- ❌ **Ref forwarding issues** - Requires `forwardRef`

#### Decision Matrix

| Need                            | Use Custom Hook | Use HOC |
| ------------------------------- | --------------- | ------- |
| Share stateful logic            | ✅              | ❌      |
| Fetch data                      | ✅              | ❌      |
| Subscribe to events             | ✅              | ❌      |
| Authentication state            | ✅              | ❌      |
| Conditional rendering           | ❌              | ✅      |
| Feature flags (hide components) | ❌              | ✅      |
| Error boundary wrapper          | ❌              | ✅      |
| Legacy class component support  | ❌              | ✅      |

**General Rule**: Default to custom hooks. Only use HOCs when you need to conditionally render or completely replace a component.

### Component Composition

**Standard**: Favor composition over inheritance. Build complex UIs from smaller, reusable components.

```jsx
// Good: Compositional approach
function Card({ children, header, footer }) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
```

---

## React 19 Features & Hooks

### The `use()` Hook

**Standard**: Use the `use()` hook for reading promises and context in render. This replaces traditional `useEffect` + `useState` patterns for async data.

```jsx
import { use } from "react";

function UserData({ userPromise }) {
  // use() can read promises directly in render
  const user = use(userPromise);

  return <div>{user.name}</div>;
}

// use() can also read context
function ThemedComponent() {
  const theme = use(ThemeContext);
  return <div className={theme}>Content</div>;
}
```

**Key Features**:

- Can be called conditionally or in loops (unlike other hooks)
- Works with Suspense boundaries
- Supports both promises and context

### Actions & Transitions

**Standard**: Use Actions (async functions in transitions) for handling form submissions and async operations.

```jsx
import { useTransition } from "react";

function TodoApp() {
  const [isPending, startTransition] = useTransition();
  const [todos, setTodos] = useState([]);

  const addTodo = async (title) => {
    startTransition(async () => {
      const newTodo = await api.createTodo(title);
      setTodos([...todos, newTodo]);
    });
  };

  return (
    <div>
      <TodoForm onAdd={addTodo} isLoading={isPending} />
      {isPending && <Spinner />}
    </div>
  );
}
```

### `useActionState` Hook

**Standard**: Use `useActionState` for form actions with automatic pending state and error handling.

```jsx
import { useActionState } from "react";

function FormComponent() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await submitForm(formData);
      return result;
    },
    null // initial state
  );

  return (
    <form action={formAction}>
      <input name="title" />
      <button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
      {state?.error && <div>{state.error}</div>}
    </form>
  );
}
```

### `useOptimistic` Hook

**Standard**: Use `useOptimistic` for instant UI feedback before server confirmation.

```jsx
import { useOptimistic } from "react";

function TodoList({ todos, onToggle }) {
  const [optimisticTodos, updateOptimistic] = useOptimistic(
    todos,
    (state, newTodo) => [...state, newTodo]
  );

  const handleAdd = async (title) => {
    const tempTodo = { id: Date.now(), title, completed: false };

    // Show optimistic update immediately
    updateOptimistic(tempTodo);

    // Send to server
    await onToggle(title);
    // UI automatically reverts or updates based on server response
  };

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### `useFormStatus` Hook

**Standard**: Use `useFormStatus` to check parent form submission status.

```jsx
import { useFormStatus } from "react";

function SubmitButton() {
  const { pending, data, method } = useFormStatus();

  return (
    <button disabled={pending}>{pending ? "Submitting..." : "Submit"}</button>
  );
}

function MyForm() {
  return (
    <form action={handleSubmit}>
      <input name="email" />
      <SubmitButton />
    </form>
  );
}
```

### Form Integration

**Standard**: Use native form actions with React 19's automatic form handling.

```jsx
function ContactForm() {
  async function handleSubmit(formData) {
    "use server"; // If using Server Actions
    const email = formData.get("email");
    await sendEmail(email);
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <button type="submit">Send</button>
    </form>
  );
}
```

---

## Server Components & Directives

### Default Server Components

**Standard**: Components are Server Components by default in React 19. No directive needed.

```jsx
// This is a Server Component by default
async function ProductList() {
  const products = await db.query("SELECT * FROM products");

  return (
    <div>
      {products.map((p) => (
        <ProductCard key={p.id} {...p} />
      ))}
    </div>
  );
}
```

### `"use client"` Directive

**Standard**: Add `"use client"` at the top of files that need client-side interactivity.

```jsx
"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

**Use `"use client"` when**:

- Using state (`useState`, `useReducer`)
- Using effects (`useEffect`, `useLayoutEffect`)
- Using browser APIs (window, document, etc.)
- Handling events (onClick, onChange, etc.)

### `"use server"` Directive

**Standard**: Use `"use server"` for Server Functions/Actions, not components.

```jsx
"use server";

export async function createUser(formData) {
  const name = formData.get("name");
  const user = await db.users.create({ name });
  revalidatePath("/users");
  return user;
}
```

**File-level vs Function-level**:

```jsx
// File-level: All exports are server functions
"use server";

export async function action1() {}
export async function action2() {}

// Function-level: Mark individual functions
export async function serverAction() {
  "use server";
  // Server-only code
}
```

### Component Composition Rules

**Standards**:

- ✅ Server Components can import Server Components
- ✅ Server Components can import Client Components
- ❌ Client Components CANNOT import Server Components
- ✅ Client Components can receive Server Components as props/children

```jsx
// Good: Server Component importing Client Component
import ClientCounter from "./ClientCounter"; // has "use client"

export default function Page() {
  return (
    <div>
      <h1>Server Rendered Title</h1>
      <ClientCounter />
    </div>
  );
}

// Good: Passing Server Component as children
("use client");

export function ClientWrapper({ children }) {
  return <div className="wrapper">{children}</div>;
}

// Usage
<ClientWrapper>
  <ServerComponent /> {/* Works! */}
</ClientWrapper>;
```

---

## State Management

### Local State First

**Standard**: Use local component state (`useState`) for component-specific data.

```jsx
function TodoForm() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("P2");

  return (
    <form>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="P1">P1</option>
        <option value="P2">P2</option>
      </select>
    </form>
  );
}
```

### Context for Shared State

**Standard**: Use Context API for state shared across multiple components.

```jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
```

### External State Management

**Standard**: For complex global state, use modern libraries like Zustand, Jotai, or React Query.

```jsx
// Zustand example
import { create } from "zustand";

const useStore = create((set) => ({
  todos: [],
  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),
  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),
}));

function TodoList() {
  const todos = useStore((state) => state.todos);
  const addTodo = useStore((state) => state.addTodo);

  // Component logic
}
```

### Lazy Initialization

**Standard**: Use lazy initialization for expensive initial state calculations.

```jsx
// Good: Lazy initialization
const [state, setState] = useState(() => {
  const saved = localStorage.getItem("theme");
  return saved || "light";
});

// Avoid: Runs on every render
const [state, setState] = useState(localStorage.getItem("theme") || "light");
```

---

## Performance Optimization

### React.memo for Expensive Components

**Standard**: Wrap components in `memo` to prevent unnecessary re-renders.

```jsx
import { memo } from "react";

const TodoItem = memo(function TodoItem({ todo, onToggle, onDelete }) {
  console.log("TodoItem rendered");

  return (
    <div>
      <span>{todo.title}</span>
      <button onClick={() => onToggle(todo.id)}>Toggle</button>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
});

export default TodoItem;
```

### useMemo for Expensive Calculations

**Standard**: Use `useMemo` to memoize expensive computations.

```jsx
import { useMemo } from "react";

function TodoList({ todos, filter }) {
  const filteredTodos = useMemo(() => {
    console.log("Filtering todos...");
    return todos.filter((todo) => {
      if (filter === "completed") return todo.completed;
      if (filter === "active") return !todo.completed;
      return true;
    });
  }, [todos, filter]); // Only recalculate when these change

  return (
    <ul>
      {filteredTodos.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### useCallback for Function Stability

**Standard**: Use `useCallback` to maintain stable function references for child components.

```jsx
import { useCallback } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([]);

  // Stable function reference across renders
  const handleToggle = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []); // Empty deps: function never changes

  const handleDelete = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, []);

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### Code Splitting & Lazy Loading

**Standard**: Use `React.lazy()` and dynamic imports for code splitting.

```jsx
import { lazy, Suspense } from "react";

// Lazy load heavy components
const Dashboard = lazy(() => import("./Dashboard"));
const Analytics = lazy(() => import("./Analytics"));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <Analytics />
      </Suspense>
    </div>
  );
}
```

### Avoid Inline Objects & Functions

**Standard**: Don't create new objects/functions in render unless necessary.

```jsx
// Bad: Creates new object every render
<UserProfile style={{ margin: 10 }} />

// Good: Define outside or memoize
const profileStyle = { margin: 10 };
<UserProfile style={profileStyle} />

// Bad: New function every render
<button onClick={() => console.log('clicked')}>Click</button>

// Good: Use useCallback for complex handlers
const handleClick = useCallback(() => {
  // Complex logic
}, [deps]);
<button onClick={handleClick}>Click</button>
```

---

## TypeScript Integration

**Note**: TypeScript is **optional** but highly recommended for larger projects. All examples below can be written in plain JavaScript.

### Component Props Typing

**Standard**: Define explicit TypeScript interfaces for all component props when using TypeScript.

```tsx
// TypeScript (recommended for large projects)
interface TodoFormProps {
  onAdd: (title: string, priority: string) => Promise<void>;
  isLoading: boolean;
}

function TodoForm({ onAdd, isLoading }: TodoFormProps) {
  // Component implementation
}

// JavaScript (perfectly acceptable)
function TodoForm({ onAdd, isLoading }) {
  // Component implementation - use JSDoc for documentation
}

/**
 * @param {Object} props
 * @param {(title: string, priority: string) => Promise<void>} props.onAdd
 * @param {boolean} props.isLoading
 */
function TodoFormWithJSDoc({ onAdd, isLoading }) {
  // Component implementation
}
```

### Hook Return Types

**Standard**: Type custom hook return values explicitly.

```tsx
interface UseThemeReturn {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme };
}
```

### Event Handlers

**Standard**: Use React's built-in event types.

```tsx
import { ChangeEvent, FormEvent } from "react";

function SearchForm() {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}
```

### Generic Components

**Standard**: Use TypeScript generics for reusable components.

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List<Todo> items={todos} renderItem={(todo) => <span>{todo.title}</span>} />;
```

---

## File Organization

### Atomic Design Structure

**Standard**: Organize components using atomic design principles.

```
src/
├── components/
│   ├── atoms/           # Basic building blocks
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Label/
│   ├── molecules/       # Simple component groups
│   │   ├── FormField/
│   │   └── SearchBar/
│   ├── organisms/       # Complex components
│   │   ├── TodoForm/
│   │   └── Header/
│   └── templates/       # Page layouts
│       └── MainLayout/
├── pages/              # Route components
├── hooks/              # Custom hooks
├── contexts/           # Context providers
├── utils/              # Helper functions
├── types/              # TypeScript types
└── api/                # API calls
```

### Component File Structure

**Standard**: Co-locate related files with the component.

```
components/
└── TodoForm/
    ├── TodoForm.tsx       # Component
    ├── TodoForm.test.tsx  # Tests
    ├── TodoForm.module.css # Styles
    ├── useTodoForm.ts     # Custom hook (if complex)
    └── index.ts           # Barrel export
```

### Barrel Exports

**Standard**: Use index files for cleaner imports.

```ts
// components/atoms/index.ts
export { Button } from "./Button/Button";
export { Input } from "./Input/Input";
export { Label } from "./Label/Label";

// Usage
import { Button, Input, Label } from "@/components/atoms";
```

---

## Naming Conventions

### Component Names

**Standard**: Use PascalCase for components.

```jsx
// Good
function UserProfile() {}
function TodoList() {}
const NavigationBar = () => {};

// Bad
function userProfile() {}
function todo_list() {}
```

### Custom Hooks

**Standard**: Prefix custom hooks with `use`.

```jsx
// Good
function useLocalStorage(key) {}
function useDebounce(value, delay) {}
function useAuth() {}

// Bad
function localStorage(key) {}
function debounce(value, delay) {}
```

### Event Handlers

**Standard**: Prefix event handlers with `handle` or `on`.

```jsx
function TodoForm() {
  const handleSubmit = (e) => {};
  const handleChange = (e) => {};
  const handleDelete = (id) => {};

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}

// For props, use 'on' prefix
interface Props {
  onSubmit: () => void;
  onChange: (value: string) => void;
}
```

### Boolean Props & Variables

**Standard**: Use `is`, `has`, `should` prefixes for booleans.

```jsx
// Good
const isLoading = true;
const hasError = false;
const shouldRender = true;

function Modal({ isOpen, hasCloseButton, shouldAnimate }) {}

// Bad
const loading = true;
const error = false;
function Modal({ open, closeButton, animate }) {}
```

### Constants

**Standard**: Use UPPER_SNAKE_CASE for constants.

```jsx
const API_BASE_URL = "https://api.example.com";
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_THEME = "light";
```

---

## Testing Standards

### Test File Organization

**Standard**: Co-locate tests with components using `.test.tsx` or `.spec.tsx`.

```
TodoForm/
├── TodoForm.tsx
├── TodoForm.test.tsx
└── index.ts
```

### Testing Library Usage

**Standard**: Use React Testing Library for component tests.

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TodoForm } from "./TodoForm";

describe("TodoForm", () => {
  it("should submit form with valid data", async () => {
    const mockOnAdd = jest.fn();

    render(<TodoForm onAdd={mockOnAdd} isLoading={false} />);

    const input = screen.getByPlaceholderText(/enter todo title/i);
    const button = screen.getByRole("button", { name: /add/i });

    fireEvent.change(input, { target: { value: "New Todo" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledWith("New Todo", "P2");
    });
  });

  it("should focus input on validation error", () => {
    const mockOnAdd = jest.fn();

    render(<TodoForm onAdd={mockOnAdd} isLoading={false} />);

    const button = screen.getByRole("button", { name: /add/i });
    fireEvent.click(button); // Submit empty form

    const input = screen.getByPlaceholderText(/enter todo title/i);
    expect(input).toHaveFocus();
  });
});
```

### Hook Testing

**Standard**: Use `@testing-library/react-hooks` for custom hook tests.

```tsx
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("should increment counter", () => {
    const { result } = renderHook(() => useCounter(0));

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### Test Coverage Goals

**Standard**: Aim for the following coverage:

- Utility functions: 100%
- Components: 80%+
- Integration tests: Critical user flows
- E2E tests: Main application workflows

---

## Code Quality & Tooling

### ESLint Configuration

**Standard**: Use ESLint with React-specific rules.

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

### Prettier Configuration

**Standard**: Use Prettier for consistent formatting.

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

### Pre-commit Hooks

**Standard**: Use Husky and lint-staged for automated checks.

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### Import Organization

**Standard**: Group imports in the following order:

```jsx
// 1. React imports
import { useState, useEffect, useCallback } from "react";

// 2. External library imports
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

// 3. Internal absolute imports
import { Button } from "@/components/atoms";
import { useAuth } from "@/hooks";

// 4. Relative imports
import { TodoItem } from "./TodoItem";
import styles from "./TodoList.module.css";

// 5. Type imports (if using TypeScript)
import type { Todo } from "@/types";
```

### Comment Standards

**Standard**: Write self-documenting code; use comments sparingly for complex logic.

```jsx
// Good: Explains WHY, not WHAT
// Calculate discount based on user tier and purchase history
const discount = calculateDiscount(user, cart);

// Bad: Explains obvious code
// Set the count to 0
const count = 0;
```

---

## Additional Best Practices

### Error Boundaries

**Standard**: Wrap components with Error Boundaries to catch rendering errors.

```jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>;
```

### Accessibility (a11y)

**Standard**: Follow WCAG guidelines for accessible components.

```jsx
// Good: Semantic HTML and ARIA labels
<button
  onClick={handleDelete}
  aria-label={`Delete ${todo.title}`}
>
  <TrashIcon />
</button>

<input
  type="text"
  id="email"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && <span id="email-error" role="alert">Invalid email</span>}
```

### Emoji Usage

**Standard**: Emojis are acceptable for **demo/educational purposes** and **debug/development tools**. Avoid in production user-facing interfaces.

```jsx
// Acceptable: Debug panels, educational demos
<button className="btn-debug" aria-label="Toggle debug panel">
  🐛
</button>

<ThemeToggle>
  {theme === 'light' ? '🌙' : '☀️'}
</ThemeToggle>

// Avoid: Production interfaces (use icons/SVGs instead)
<button>Delete 🗑️</button> // Use <TrashIcon /> instead
```

**When emojis are okay**:

- Demo applications and tutorials
- Debug/developer tools
- Internal admin panels
- Prototypes and MVPs

**When to avoid**:

- Production customer-facing UIs
- Enterprise applications
- Internationalized apps (emoji meanings vary)

### Environment Variables

**Standard**: Use environment variables for configuration.

```jsx
// .env
VITE_API_URL=https://api.example.com
VITE_API_KEY=secret

// Usage in Vite
const apiUrl = import.meta.env.VITE_API_URL;

// Usage in Next.js
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Avoid Direct DOM Manipulation

**Standard**: Use refs sparingly; prefer React's declarative approach.

```jsx
// Good: Use ref for focus management
function SearchInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} />;
}

// Bad: Direct DOM manipulation
function SearchInput() {
  useEffect(() => {
    document.getElementById("search").focus();
  }, []);

  return <input id="search" />;
}
```

---

## Framework Recommendations (2025)

### Next.js

**Best for**: Full-stack React applications with SSR/SSG

- Built-in routing
- Server Components support
- API routes
- Optimized builds

### Vite

**Best for**: Fast development experience, SPAs

- Lightning-fast HMR
- Modern build tooling
- Plugin ecosystem

### Remix

**Best for**: Data-heavy applications

- Nested routing
- Built-in data loading
- Form handling
- Progressive enhancement

---

## References

- [React 19 Official Documentation](https://react.dev/blog/2024/12/05/react-19)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Server Components](https://react.dev/reference/rsc/server-components)
- [TypeScript with React](https://react.dev/learn/typescript)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## Version

**Document Version**: 1.0
**Last Updated**: 2025-10-19
**React Version**: 19.x
