# React - Components Overview

## The Two Worlds of React

| World                      | Description                                             | Components Type                      | Need 'use client'?                 |
| -------------------------- | ------------------------------------------------------- | ------------------------------------ | ---------------------------------- |
| **Client-Side Only**       | Traditional React apps that run entirely in the browser | All components are Client Components | ❌ Never                           |
| **Full-Stack React (RSC)** | React apps with Server + Client Components              | Mix of Server and Client Components  | ✅ Yes, for interactive components |

---

## World 1: Client-Side Only Apps

**All components run in the browser. No Server Components.**

### Frameworks/Tools

| Framework/Tool                | Need 'use client'? |
| ----------------------------- | ------------------ |
| Vite + React                  | ❌ No              |
| Create React App (deprecated) | ❌ No              |
| Parcel                        | ❌ No              |
| Webpack (custom)              | ❌ No              |
| Next.js **Pages Router**      | ❌ No              |
| Remix (without RSC)           | ❌ No              |

### Example

```javascript
// ❌ NO 'use client' needed
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

export default Counter;
```

**Why?** All components are client components by default. There are no Server Components.

---

## World 2: Full-Stack React (with RSC)

**Components can run on the server OR client. Server Components are the default.**

### Frameworks/Tools

| Framework/Tool               | Need 'use client'? |
| ---------------------------- | ------------------ |
| Next.js **App Router** (13+) | ✅ Yes             |
| Remix (with RSC enabled)     | ✅ Yes             |
| Gatsby (with RSC enabled)    | ✅ Yes             |
| Waku                         | ✅ Yes             |
| Redwood (with RSC enabled)   | ✅ Yes             |

### When to Use 'use client'

| Feature                       | Needs 'use client'? | Example                                 |
| ----------------------------- | ------------------- | --------------------------------------- |
| `useState`                    | ✅ Yes              | `const [count, setCount] = useState(0)` |
| `useEffect`                   | ✅ Yes              | `useEffect(() => {...}, [])`            |
| `useContext`                  | ✅ Yes              | `const value = useContext(MyContext)`   |
| `useRef`                      | ✅ Yes              | `const ref = useRef(null)`              |
| Event handlers                | ✅ Yes              | `onClick`, `onChange`, `onSubmit`       |
| Browser APIs                  | ✅ Yes              | `localStorage`, `window`, `document`    |
| Custom hooks (that use above) | ✅ Yes              | `useFetch`, `useDebounce`               |
| Static content                | ❌ No               | Just rendering JSX without state        |
| Database queries              | ❌ No               | `const data = await db.query()`         |
| File system access            | ❌ No               | `await fs.readFile()`                   |

### Example

```javascript
// ✅ NEED 'use client' - uses useState and onClick
"use client";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

export default Counter;
```

```javascript
// ❌ NO 'use client' - Server Component (default)
async function UserList() {
  const users = await db.users.findMany();
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default UserList;
```

---

## Quick Decision Tree

```
Are you using Next.js App Router, Remix (with RSC), or similar?
│
├─ NO → You're in World 1 (Client-Side Only)
│        ❌ Never use 'use client'
│        All components are client components
│
└─ YES → You're in World 2 (Full-Stack React)
         │
         ├─ Does your component use hooks or event handlers?
         │  ├─ YES → ✅ Add 'use client'
         │  └─ NO → ❌ Don't add it (Server Component)
         │
         └─ Does your component access browser APIs?
            ├─ YES → ✅ Add 'use client'
            └─ NO → ❌ Don't add it (Server Component)
```

---

## How to Identify Your World

### Check Your Project Structure

**World 2 (Full-Stack RSC):**

```
my-app/
├── app/              ← Next.js App Router
│   ├── page.tsx
│   └── layout.tsx
```

**World 1 (Client-Side Only):**

```
my-app/
├── src/              ← Vite, CRA, etc.
│   ├── App.jsx
│   └── main.jsx
```

```
my-app/
├── pages/            ← Next.js Pages Router
│   └── index.tsx
```

### Check Your package.json

**World 2 (Full-Stack RSC):**

```json
{
  "dependencies": {
    "next": "^15.0.0"
  }
}
```

_And using the `app/` directory_

**World 1 (Client-Side Only):**

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "vite": "^6.0.0"
  }
}
```

---

## Common Scenarios

| Scenario                              | World   | Need 'use client'?       |
| ------------------------------------- | ------- | ------------------------ |
| Building a simple SPA with Vite       | World 1 | ❌ No                    |
| Using CRA (legacy)                    | World 1 | ❌ No                    |
| Next.js with `pages/` directory       | World 1 | ❌ No                    |
| Next.js with `app/` directory         | World 2 | ✅ Sometimes             |
| Adding a button with onClick          | World 1 | ❌ No                    |
| Adding a button with onClick          | World 2 | ✅ Yes                   |
| Fetching data with useEffect          | World 1 | ❌ No                    |
| Fetching data with useEffect          | World 2 | ✅ Yes                   |
| Fetching data with await in component | World 1 | ❌ Not possible          |
| Fetching data with await in component | World 2 | ❌ No (Server Component) |

---

## Key Takeaways

### World 1: Client-Side Only

- ✅ All components are client components automatically
- ✅ Use hooks, event handlers, browser APIs freely
- ❌ Never write `'use client'`
- ❌ Cannot do server-side data fetching in components

### World 2: Full-Stack React (RSC)

- ✅ Components are Server Components by default
- ✅ Write `'use client'` for interactive components
- ✅ Can mix Server and Client Components
- ✅ Can fetch data on server without APIs

---

## Still Confused?

**Simple rule:**

If you're NOT using Next.js App Router (or similar RSC framework), **ignore `'use client'` completely**.

If you ARE using Next.js App Router, add `'use client'` **only when you see an error** about hooks or client features.

**Default behavior:**

- **World 1:** Everything is client-side (no directive needed)
- **World 2:** Everything is server-side (add `'use client'` for interactive parts)
