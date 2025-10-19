# React 19 - Lifecycle

## Component Lifecycle & Hook Execution Order

Understanding when hooks run in the component lifecycle:

```
Component Lifecycle Flow:
│
1. ⚙️  RENDER PHASE (Prepare what to show)
│   ├─ useState/useReducer - Initialize or get current state
│   ├─ useContext - Read current context value
│   ├─ useRef - Get/create ref object
│   ├─ useMemo - Calculate or return cached value
│   ├─ useCallback - Create or return cached function
│   └─ Return JSX
│
2. 🎨 COMMIT PHASE (Update the DOM)
│   └─ React updates the actual DOM
│
3. 🖼️  BROWSER PAINT (User sees the update)
│   └─ Browser displays changes on screen
│
4. ⚡ EFFECT PHASE (Side effects run)
    └─ useEffect - Run side effects AFTER paint
```

### Detailed Execution Timeline

```javascript
function LifecycleDemo({ userId }) {
  console.log("1. Render starts");

  // These all run DURING render (synchronously)
  const [count, setCount] = useState(0);
  console.log("2. useState initialized");

  const contextValue = useContext(MyContext);
  console.log("3. useContext read");

  const divRef = useRef(null);
  console.log("4. useRef created/accessed");

  const expensiveValue = useMemo(() => {
    console.log("5. useMemo calculating");
    return count * 2;
  }, [count]);

  const handleClick = useCallback(() => {
    console.log("6. useCallback function created/cached");
    setCount((c) => c + 1);
  }, []);

  console.log("7. About to return JSX");

  // This runs AFTER everything is painted to screen
  useEffect(() => {
    console.log("9. useEffect runs AFTER paint");
    // API calls, subscriptions, etc.
  }, [userId]);

  console.log("8. Returning JSX now");
  return (
    <div ref={divRef} onClick={handleClick}>
      {expensiveValue}
    </div>
  );

  // Actual console output order:
  // 1. Render starts
  // 2. useState initialized
  // 3. useContext read
  // 4. useRef created/accessed
  // 5. useMemo calculating
  // 6. useCallback function created/cached
  // 7. About to return JSX
  // 8. Returning JSX now
  // [DOM updates and browser paints]
  // 9. useEffect runs AFTER paint
}
```

### Quick Reference: Timing

| Hook              | Phase        | Blocks Render? | When to Use                     |
| ----------------- | ------------ | -------------- | ------------------------------- |
| useState          | Render       | No             | Storing UI state                |
| useReducer        | Render       | No             | Complex state logic             |
| useContext        | Render       | No             | Reading shared data             |
| useRef            | Render       | No             | Storing non-state values        |
| useMemo           | Render       | Yes (briefly)  | Expensive calculations          |
| useCallback       | Render       | No             | Caching functions               |
| useEffect         | After Paint  | No             | Side effects (async operations) |
| useLayoutEffect\* | Before Paint | Yes            | DOM measurements                |

\*useLayoutEffect is like useEffect but runs synchronously before the browser paints, blocking the paint. Use it only when you need to read/modify the DOM before the user sees it.

### Common Timing Gotchas

```javascript
// ❌ WRONG: Trying to use DOM ref before it exists
function BadExample() {
  const divRef = useRef(null);

  // This runs DURING render - ref.current is still null!
  console.log(divRef.current); // null
  divRef.current?.scrollIntoView(); // Won't work!

  return <div ref={divRef}>Hello</div>;
}

// ✅ CORRECT: Access DOM in useEffect (after render)
function GoodExample() {
  const divRef = useRef(null);

  useEffect(() => {
    // Now ref.current exists!
    console.log(divRef.current); // <div>Hello</div>
    divRef.current?.scrollIntoView(); // Works!
  }, []);

  return <div ref={divRef}>Hello</div>;
}

// ❌ WRONG: API call during render
function BadAPICall({ userId }) {
  const [user, setUser] = useState(null);

  // This runs on EVERY render - infinite loop!
  fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .then(setUser); // This causes re-render, which fetches again!

  return <div>{user?.name}</div>;
}

// ✅ CORRECT: API call in useEffect
function GoodAPICall({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Runs AFTER render, only when userId changes
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```
