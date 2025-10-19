# React 19 - Components - React Server Components

As of Oct 2025, React Server Components (RSC) require a framework that supports RSC (Next.js 13+, Remix, etc.)

## 🎓 Mental Model

Think of React 19 as having **two environments** for a full stack React app

```
┌─────────────────┐          ┌─────────────────┐
│     SERVER      │          │     CLIENT      │
│                 │          │                 │
│ - Fetch data    │  ───────>│ - Interactivity │
│ - Run queries   │  HTML/RSC│ - User events   │
│ - Heavy compute │  Payload │ - State updates │
│ - Secrets safe  │          │ - Animations    │
└─────────────────┘          └─────────────────┘
      ↑                              │
      └──────── Server Actions ──────┘
```

---

## 🎯 Key Directives

| Directive      | Purpose                                                   | Example                                  |
| -------------- | --------------------------------------------------------- | ---------------------------------------- |
| (no directive) | Default = Server Component                                | Data fetching, static content            |
| `'use client'` | Marks component as Client Component (needs interactivity) | Client-side state, hooks, event handlers |
| `'use server'` | Marks function as Server Action (runs on server)          | Database mutations, file uploads         |

---

## 📊 Quick Comparison

| Feature         | Traditional React       | React 19 with RSC      |
| --------------- | ----------------------- | ---------------------- |
| Where code runs | Browser only            | Server + Browser       |
| Bundle size     | Full app shipped        | Only interactive parts |
| Data fetching   | useEffect + API         | Direct server access   |
| Forms           | Manual state management | Built-in Actions       |
| SEO             | Needs SSR setup         | Built-in with RSC      |

---

## 🚀 When to Use What

**Use Server Components for:**

- Data fetching from databases
- Static content
- SEO-critical pages
- Heavy computations
- Anything that doesn't need interactivity

**Use Client Components for:**

- Interactive UI (buttons, forms with state)
- Browser APIs (localStorage, geolocation)
- Event handlers
- Hooks (useState, useEffect, etc.)
- Real-time updates

**Use Server Actions for:**

- Form submissions
- Database mutations
- File uploads
- Authentication
- Any server-side operation from client

---

## ⚠️ Important Notes

- **Server Components are the default** - no directive needed
- Only Client Components can use hooks like `useState`, `useEffect`
- Server Components can import Client Components, but not vice versa
- Server Actions must be marked with `'use server'`
- Not all React 19 features require a framework (ref as prop, hooks work anywhere)

---