# React 19 Todo App Demo

A comprehensive demo showcasing React 19 features, hooks, patterns, and performance optimizations.

## Quick Start

```bash
npm install
npm run dev
```

## Features

- ✅ Multiple todo lists with CRUD operations
- ✅ Priority levels (P1, P2, P3) with form inputs
- ✅ Dark mode toggle with theme persistence
- ✅ Mock async API with 500ms delay
- ✅ Authentication flow (HOC pattern)
- ✅ Performance optimizations (React.memo, useCallback)

## React Hooks Demonstrated

| Hook            | Usage                              | Location                                               |
| --------------- | ---------------------------------- | ------------------------------------------------------ |
| **useState**    | Form inputs, lists, loading states | All components                                         |
| **useEffect**   | Data fetching, localStorage sync   | `App.jsx:22`, `TodoList.jsx:13`, `ThemeContext.jsx:13` |
| **useRef**      | Input focus, render count tracking | `TodoForm.jsx:10`, `App.jsx:14`                        |
| **useContext**  | Global theme state                 | `ThemeToggle.jsx:6` via `useTheme()`                   |
| **useCallback** | Memoized event handlers            | `App.jsx:38`, `TodoList.jsx:33`                        |

## Patterns & Optimizations

- **HOC** - `withAuth` wraps App for authentication (`hoc/withAuth.jsx`)
- **Context API** - Theme provider with custom hook (`context/ThemeContext.jsx`)
- **React.memo** - All components memoized to prevent unnecessary re-renders
- **Functional updates** - `setState(prev => ...)` to avoid stale closures
- **Cleanup functions** - Prevent memory leaks in `useEffect`

## Project Structure

```
src/
├── api/mockApi.js           # Async CRUD operations
├── components/
│   ├── ThemeToggle.jsx      # useContext example
│   ├── TodoForm.jsx         # useRef for input focus
│   ├── TodoItem.jsx         # React.memo optimization
│   └── TodoList.jsx         # useEffect for data fetching
├── context/ThemeContext.jsx # Context API setup
├── hoc/withAuth.jsx         # Higher-Order Component
├── styles/app.scss          # SCSS with kebab-case
├── App.jsx                  # Main component
└── main.jsx                 # Entry point
```

## Key Implementation Details

### useRef - Input Focus

After form submission, inputs auto-focus without causing re-renders:

```javascript
const inputRef = useRef(null);
inputRef.current?.focus(); // TodoForm.jsx:24
```

### useEffect - Data Fetching with Cleanup

```javascript
useEffect(() => {
  let isMounted = true;
  fetchData().then((data) => {
    if (isMounted) setData(data); // Only update if mounted
  });
  return () => {
    isMounted = false;
  }; // Cleanup
}, [dependency]);
```

### useCallback - Memoized Handlers

Prevents function recreation to avoid child re-renders:

```javascript
const handleDelete = useCallback(async (id) => {
  await mockApi.deleteItem(id);
  setItems((prev) => prev.filter((item) => item.id !== id));
}, []); // Empty deps = never recreates
```

### React.memo - Render Optimization

```javascript
const TodoItem = memo(function TodoItem({ item, onToggle }) {
  // Only re-renders when item or onToggle changes
});
```

## Observing Performance

1. **Render Counter** - Header shows App render count (useRef)
2. **Console Logs** - "TodoItem rendered: [id]" only when that item changes
3. **Test Actions**:
   - ✅ Create list → App re-renders
   - ❌ Toggle todo → Only that TodoItem re-renders
   - ❌ Add todo → Only TodoList re-renders

## Usage

1. Click "Log In" to authenticate
2. Create a list with a title
3. Add todos with priority (P1/P2/P3)
4. Toggle theme with 🌙/☀️ button
5. Check render counter to see optimization

## Technologies

- React 19
- Vite
- SCSS (kebab-case classes)
- Mock async API
