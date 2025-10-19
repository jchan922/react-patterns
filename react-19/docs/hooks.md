# React 19 - Hooks

**Complete guide to React's built-in hooks.** For coding standards and best practices, see [coding-standards.md](../coding-standards.md).

## When to Use What - Quick Table

**Sorted by execution order in the component lifecycle:**

For more on component lifecycles, see [lifecycle.md](/react-19/lifecycle.md).

| Hook            | When It Runs                   | When to Use                                                              | Simple Explanation                                          |
| --------------- | ------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| **useState**    | During render (initialization) | When you need data that changes AND you want the UI to update            | "Remember this and re-render when it changes"               |
| **useReducer**  | During render (initialization) | When you have complex state logic (like multiple related state values)   | "useState on steroids for complex state"                    |
| **useContext**  | During render                  | When you need to share data across many components without passing props | "Get shared data from anywhere in the tree"                 |
| **useRef**      | During render (initialization) | When you need to remember something BUT don't want to re-render          | "Remember this but don't re-render" OR "Grab a DOM element" |
| **useMemo**     | During render (before JSX)     | When you have expensive calculations you want to cache                   | "Only recalculate this if dependencies change"              |
| **useCallback** | During render (before JSX)     | When you want to prevent functions from being recreated on every render  | "Keep the same function unless dependencies change"         |
| **useEffect**   | AFTER render & paint           | When you need to do something AFTER render (API calls, subscriptions)    | "Do this side effect after rendering"                       |

---

## Quick Decision Tree

```
Need to remember something?
│
├─ Should UI update when it changes?
│  ├─ YES → useState
│  └─ NO → useRef
│
├─ Needed by many components at different levels?
│  └─ YES → useContext
│
├─ Need to fetch data or run side effects?
│  └─ YES → useEffect
│
└─ Need to optimize performance?
   ├─ Expensive calculation → useMemo
   └─ Passing functions to children → useCallback
```

The most important thing to remember: **useState** re-renders, **useRef** doesn't, and **useContext** shares data across components!

---

## Deep Dive: useState vs useRef vs useContext

### **useState** - "I need the UI to update when this changes"

useState declares a state variable that you can update directly, letting a component remember information like user input.

**When to use:**

- Counting clicks, likes, or votes
- Form inputs (text, checkboxes)
- Toggle states (open/closed, light/dark mode)
- Lists that grow or shrink
- **Anything where changing it should update what's on screen**

```javascript
function Counter() {
  // When count changes, the component re-renders
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}

// More examples
function FormExample() {
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
    </div>
  );
}
```

**Key point:** Every time you call `setCount`, React re-renders the component to show the new value.

---

### **useRef** - "Remember this, but DON'T re-render"

useRef declares a ref that can hold any value, but most often it's used to hold a DOM node. Unlike state, updating a ref does not re-render your component.

**When to use:**

- Access DOM elements (focus an input, scroll to element, measure size)
- Store values that need to persist between renders but shouldn't cause re-renders
- Keep track of previous values
- Store timeout/interval IDs

```javascript
// Use Case 1: Accessing DOM elements
function TextInputWithFocus() {
  const inputRef = useRef(null);

  const handleClick = () => {
    // Access the actual DOM input element
    inputRef.current.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>Focus the input</button>
    </div>
  );
}

// Use Case 2: Storing values without re-rendering
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = () => {
    // Store interval ID - changing this won't re-render
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  return (
    <div>
      <p>Seconds: {seconds}</p>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}

// Use Case 3: Tracking previous value
function UsernameDisplay({ username }) {
  const previousUsername = useRef("");

  useEffect(() => {
    previousUsername.current = username;
  }, [username]);

  return (
    <div>
      <p>Current: {username}</p>
      <p>Previous: {previousUsername.current}</p>
    </div>
  );
}
```

**Key point:** Changing `ref.current` doesn't trigger a re-render. It's like a "box" to store stuff in.

---

### **useContext** - "Share data without prop drilling"

useContext reads and subscribes to a context, allowing a component to receive information from distant parents without passing it as props.

**When to use:**

- Theme (light/dark mode) needed across your whole app
- Current logged-in user info
- Language/locale settings
- Shopping cart data
- **Any data needed by many components at different levels**

```javascript
// Step 1: Create the context
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

// Step 2: Provide the context at the top level
function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <MainContent />
      <Footer />
    </ThemeContext.Provider>
  );
}

// Step 3: Use the context anywhere in the tree (no props needed!)
function Header() {
  return (
    <div>
      <Logo />
      <ThemeToggleButton /> {/* This is nested deep! */}
    </div>
  );
}

function ThemeToggleButton() {
  // Access theme without props being passed down!
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current theme: {theme}
    </button>
  );
}

// Real-world example: User authentication
const UserContext = createContext(null);

function AppWithAuth() {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      <Navigation />
      <Dashboard />
    </UserContext.Provider>
  );
}

function UserProfile() {
  const { user, logout } = useContext(UserContext);

  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Key point:** Context prevents "prop drilling" - passing props through many layers of components that don't need them.

---

## Quick Comparison: The Coffee Shop Analogy

**useState** = A number on the wall showing how many coffees were sold today

- Everyone can see it
- When it changes, everyone sees the update immediately
- Changing it causes the display to update

**useRef** = A notebook behind the counter

- Staff can write notes in it
- Customers don't see when you write something
- Changing it doesn't update any displays
- Good for keeping track of things privately

**useContext** = The WiFi password posted on the wall

- Available to everyone in the shop
- You don't have to ask each person to pass it to you
- Everyone gets the same password from the same source

---

## Other Important Hooks (Simplified)

### **useEffect** - "Do something after rendering"

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // Run this AFTER the component renders
  useEffect(() => {
    // Fetch data from API
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]); // Only re-run when userId changes

  return <div>{user?.name}</div>;
}
```

**Use for:** API calls, subscriptions, timers, DOM manipulations, event listeners

---

### **useMemo** - "Cache expensive calculations"

```javascript
function ProductList({ products, filter }) {
  // Only recalculate when products or filter changes
  const filteredProducts = useMemo(() => {
    console.log("Filtering...");
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

  return (
    <div>
      {filteredProducts.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

**Use for:** Expensive calculations, filtering/sorting large lists

---

### **useCallback** - "Keep the same function"

```javascript
function TodoApp() {
  const [todos, setTodos] = useState([]);

  // This function stays the same between renders
  const addTodo = useCallback((text) => {
    setTodos((prev) => [...prev, { id: Date.now(), text }]);
  }, []); // Empty array = never recreate

  return <TodoForm onSubmit={addTodo} />;
}
```

**Use for:** Passing functions to optimized child components

---

### **useReducer** - "Complex state logic"

```javascript
function ShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  return (
    <div>
      <button onClick={() => dispatch({ type: 'ADD_ITEM', item: {...} })}>
        Add Item
      </button>
      <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>
        Clear Cart
      </button>
    </div>
  );
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };
    case 'CLEAR_CART':
      return { items: [], total: 0 };
    default:
      return state;
  }
}
```

**Use for:** When you have multiple related state values or complex state updates
