# React 19 - Common Patterns

1. Components and Hooks Must Be Pure
   Components should be idempotent, always returning the same output given the same inputs (props, state, and context) Rules of React – React. Avoid side effects during render—use effects for operations like API calls or subscriptions.

```javascript
// ❌ BAD - Side effects during render
function ProductList({ category }) {
  fetch(`/api/products/${category}`); // Don't do this!
  return <div>Products</div>;
}

// ✅ GOOD - Pure component, side effects in useEffect
function ProductList({ category }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`/api/products/${category}`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [category]);

  return (
    <div>
      {products.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}
```

2. Follow the Rules of Hooks
   Only call Hooks at the top level of your component, never inside loops, conditions, or nested functions. Hooks should only be called from React functions, not regular JavaScript functions Rules of React – React. Use ESLint plugin to enforce these rules.

```javascript
// ❌ BAD - Hooks in conditions
function UserProfile({ isLoggedIn }) {
  if (isLoggedIn) {
    const [user, setUser] = useState(null); // Wrong!
  }
  return <div>Profile</div>;
}

// ✅ GOOD - Hooks at top level
function UserProfile({ isLoggedIn }) {
  const [user, setUser] = useState(null);

  if (!isLoggedIn) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.name}</div>;
}
```

3. One-Way Data Flow (Props Down, Events Up)
   React uses one-way data flow, passing data down the component hierarchy from parent to child component through props Thinking in React – React. Child components communicate back to parents through callback functions passed as props.

```javascript
// Parent component
function ShoppingCart() {
  const [items, setItems] = useState([]);

  const handleAddItem = (item) => {
    setItems([...items, item]);
  };

  return (
    <div>
      <ProductList onAddToCart={handleAddItem} /> {/* Event handler down */}
      <CartSummary items={items} /> {/* Data down */}
    </div>
  );
}

// Child component
function ProductList({ onAddToCart }) {
  return (
    <button onClick={() => onAddToCart({ id: 1, name: "Shoes" })}>
      Add to Cart
    </button>
  );
}
```

4. Component Composition Over Inheritance
   Break down UI into smaller, reusable components. Compose complex UIs from simple building blocks rather than using class inheritance. Keep components focused on a single responsibility.

```javascript
// ✅ GOOD - Composition with reusable components
function Button({ children, variant = "primary" }) {
  return <button className={`btn btn-${variant}`}>{children}</button>;
}

function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// Compose them together
function ProductCard({ product }) {
  return (
    <Card title={product.name}>
      <p>{product.description}</p>
      <Button variant="success">Buy Now</Button>
    </Card>
  );
}
```

5. Lift State Up to Common Ancestors
   When multiple components need to share state, find their closest common parent component and manage the state there Thinking in React – React. Share state through props rather than duplicating it across components.

```javascript
// ✅ GOOD - State lifted to parent
function TemperatureConverter() {
  const [celsius, setCelsius] = useState(0);

  const fahrenheit = (celsius * 9) / 5 + 32;

  return (
    <div>
      <TemperatureInput scale="Celsius" value={celsius} onChange={setCelsius} />
      <TemperatureInput
        scale="Fahrenheit"
        value={fahrenheit}
        onChange={(f) => setCelsius(((f - 32) * 5) / 9)}
      />
    </div>
  );
}

function TemperatureInput({ scale, value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={scale}
    />
  );
}
```

6. Treat Props and State as Immutable
   A component's props and state are immutable snapshots with respect to a single render—never mutate them directly Rules of React – React. Always create new objects/arrays when updating state instead of modifying existing ones.

```javascript
// ❌ BAD - Mutating state directly
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    todos.push({ id: Date.now(), text }); // Don't mutate!
    setTodos(todos); // This won't trigger re-render properly
  };
}

// ✅ GOOD - Creating new arrays/objects
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text }]); // New array
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed } // New object
          : todo
      )
    );
  };

  return <div>{/* render todos */}</div>;
}
```

7. Use Functional Components with Hooks
   Modern React favors functional components over class components. Hooks like useState, useEffect, and useContext provide all necessary functionality while keeping code simpler and more maintainable.

```javascript
// ✅ GOOD - Modern functional component
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser().then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

8. Avoid Prop Drilling with Context
   For deeply nested components that need the same data, use the Context API instead of passing props through multiple intermediate components. This keeps code cleaner and more maintainable.

```javascript
// Create context
const ThemeContext = createContext("light");

// Provider at top level
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

// Use anywhere deep in the tree (no prop drilling!)
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      Current: {theme}
    </button>
  );
}
```

9. Organize and Structure Your Code Consistently
   Maintain consistent file structure, naming conventions (PascalCase for components, camelCase for utilities), and import organization. Group related files together and use index files to simplify imports.

```javascript
// File: components/UserProfile.jsx
import { useState, useEffect } from "react";
import { fetchUserData } from "../services/userService";
import Avatar from "./Avatar";
import "./UserProfile.css";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData(userId).then(setUser);
  }, [userId]);

  if (!user) return null;

  return (
    <div className="user-profile">
      <Avatar src={user.avatar} />
      <h2>{user.name}</h2>
    </div>
  );
}

export default UserProfile;
```

10. Think in React: Declarative UI
    React is declarative—you tell React what to render in your component's logic, and React figures out how best to display it Rules of React – React. Describe the UI for different states rather than imperatively manipulating the DOM.

```javascript
// ❌ IMPERATIVE - Don't do this
function Form() {
  const submitForm = () => {
    document.getElementById("error").style.display = "none";
    document.getElementById("success").style.display = "block";
  };
}

// ✅ DECLARATIVE - Describe the UI based on state
function Form() {
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await submitData();
      setStatus("success");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" />
      <button disabled={status === "loading"}>
        {status === "loading" ? "Submitting..." : "Submit"}
      </button>

      {status === "success" && <p className="success">Success!</p>}
      {status === "error" && <p className="error">Error occurred</p>}
    </form>
  );
}
```
