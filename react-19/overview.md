# React 19 - Overview

## What's New in React 19

React 19 is a major release focusing on **server-side capabilities** and **developer experience improvements**. Released in December 2024, it introduces stable support for features that were experimental in React 18.

---

## 🎯 The Big Three Features

### 1. **React Server Components (RSC)**

The biggest change to React since its initial release.

**What are they?**

- Components that render **on the server** before bundling
- Run at build time or per request on a web server
- Never sent to the browser (zero JavaScript cost)

**Key Benefits:**

- ⚡ Faster initial page loads (less JavaScript to download)
- 🔒 Direct access to databases/APIs without exposing sensitive code
- 📦 Smaller bundle sizes
- 🔍 Better SEO

```javascript
// This is a Server Component by default (no directive needed)
async function UserProfile({ userId }) {
  // Direct database access - this code never goes to the client!
  const user = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Client Components vs Server Components:**

```javascript
// Server Component (default - no directive)
async function ProductList() {
  const products = await fetchProductsFromDB();
  return (
    <div>
      {products.map((p) => (
        <Product key={p.id} {...p} />
      ))}
    </div>
  );
}

// Client Component (needs 'use client' directive)
("use client");
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

### 2. **Server Actions**

Server-side functions that can be called directly from Client Components.

**What are they?**

- Functions marked with `'use server'`
- Execute on the server but can be called from the client
- No need to create separate API routes

**Key Benefits:**

- 🚫 No custom API endpoints needed
- 🎯 Type-safe by default
- 🔄 Seamless integration with forms
- ✨ Built-in pending states

```javascript
// server-actions.js
"use server";

export async function createNote(formData) {
  const title = formData.get("title");
  const content = formData.get("content");

  // Direct database write - runs on server
  await db.notes.create({ title, content });

  return { success: true };
}

// Client Component using the Server Action
("use client");
import { createNote } from "./server-actions";

function NoteForm() {
  return (
    <form action={createNote}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Save</button>
    </form>
  );
}
```

---

### 3. **Actions & New Hooks**

Simplified state management for async operations.

**New Hooks:**

#### `useActionState`

Manages form state and submissions with built-in loading/error states.

```javascript
"use client";
import { useActionState } from "react";
import { submitForm } from "./actions";

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitForm, null);

  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

#### `useFormStatus`

Gets status of parent form submission (must be inside a form component).

```javascript
"use client";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return <button disabled={pending}>{pending ? "Saving..." : "Save"}</button>;
}
```

#### `useOptimistic`

Show optimistic UI updates before server confirms.

```javascript
"use client";
import { useOptimistic } from "react";

function MessageList({ messages, sendMessage }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newMessage) => [...state, newMessage]
  );

  const handleSubmit = async (formData) => {
    const message = formData.get("message");
    addOptimistic({ text: message, pending: true });
    await sendMessage(message);
  };

  return (
    <div>
      {optimisticMessages.map((msg) => (
        <div style={{ opacity: msg.pending ? 0.5 : 1 }}>{msg.text}</div>
      ))}
    </div>
  );
}
```

#### `use`

First-class support for Promises and Context (can be used conditionally!).

```javascript
"use client";
import { use, Suspense } from "react";

function UserProfile({ userPromise }) {
  // Unlike other hooks, `use` can be called conditionally
  const user = use(userPromise);

  return <div>{user.name}</div>;
}

// Wrap with Suspense for loading state
<Suspense fallback={<div>Loading...</div>}>
  <UserProfile userPromise={fetchUser()} />
</Suspense>;
```
