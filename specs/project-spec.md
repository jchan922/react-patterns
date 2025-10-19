# React Patterns Project Specification

**Spec Version:** 1.0
**Last Updated:** 2025-10-19
**Status:** Active
**Scope:** Multi-version React time capsule

## Project Overview

**React Patterns** is a comprehensive, version-tracked learning resource and reference implementation that demonstrates React patterns, best practices, and features across different major versions of React.

### Time Capsule Architecture

Each React version gets its own isolated folder containing:
- Complete documentation specific to that version
- Working demo application
- Coding standards reflecting that era's best practices
- Feature-specific guides

**Current Structure:**
```
react-patterns/
├── specs/                    # Cross-version specifications
│   ├── project-spec.md       # This file
│   └── README.md             # Specs guide
│
├── react-19/                 # React 19.x (December 2024+)
│   ├── coding-standards.md   # React 19 standards
│   ├── docs/                 # React 19 features
│   └── demo/                 # React 19 demo app
│
├── react-20/                 # React 20.x (Future)
│   ├── coding-standards.md   # React 20 standards
│   ├── docs/                 # React 20 NEW features
│   └── demo/                 # React 20 demo app
│
└── react-21/                 # React 21.x (Future)
    └── ...                   # And so on...
```

### Purpose

- **Educational Time Machine** - Learn how React evolved across versions
- **Version Comparison** - Compare patterns between React versions side-by-side
- **Migration Guide** - Understand what changed between versions
- **Historical Reference** - See deprecated patterns and why they were replaced
- **LLM/Agent Context** - Provide version-specific documentation for AI-assisted development
- **Pattern Evolution** - Track how patterns (HOCs → Hooks → Custom Hooks) evolved

### Target Audience

- React developers learning or transitioning between versions
- Junior to senior developers studying React's evolution
- Teams maintaining legacy codebases across React versions
- LLMs and AI coding agents requiring version-specific React context
- Tech leads establishing coding standards
- Educators teaching React history

### Key Benefits of Time Capsule Approach

1. **Version Isolation** - Each version is self-contained
2. **Historical Context** - See why patterns changed
3. **Migration Clarity** - Compare old vs new side-by-side
4. **No Breaking Changes** - Old docs stay accurate forever
5. **Future Proof** - Easy to add React 20, 21, etc.

---

## Repository Structure

### Top-Level Organization

```
react-patterns/
│
├── specs/                          # Project-wide specifications
│   ├── project-spec.md             # This master spec
│   ├── README.md                   # Specs folder guide
│   └── version-comparison.md       # (Future) Version differences
│
├── react-19/                       # React 19 capsule
│   ├── coding-standards.md         # React 19 single source of truth
│   ├── docs/                       # Deep dive documentation
│   │   ├── overview.md             # React 19 features
│   │   ├── hooks.md                # Built-in hooks
│   │   ├── custom-hooks.md         # Custom hook patterns
│   │   ├── patterns.md             # Best practices
│   │   └── lifecycle.md            # Lifecycle & timing
│   └── demo/                       # Working React 19 app
│       └── src/                    # Demo source code
│
├── react-20/                       # (Future) React 20 capsule
│   ├── coding-standards.md         # React 20 standards
│   ├── docs/                       # React 20 features
│   │   ├── overview.md             # NEW React 20 features
│   │   ├── hooks.md                # Updated hooks
│   │   ├── new-feature.md          # Version-specific docs
│   │   └── ...                     # Other docs
│   └── demo/                       # React 20 demo
│
└── README.md                       # Project root README
```

### Version-Specific Folders (`/react-{VERSION}/`)

Each version folder is **completely independent** and contains:

#### Required Files

1. **`coding-standards.md`** - Single source of truth for that version
2. **`docs/`** - Version-specific deep dive documentation
3. **`demo/`** - Working demo application for that version
4. **`README.md`** (optional) - Version-specific notes

#### Documentation Flexibility

**Important:** `/docs/*` files can differ between versions!

- React 19 has: `overview.md`, `hooks.md`, `custom-hooks.md`, `patterns.md`, `lifecycle.md`
- React 20 might add: `new-feature.md`, `compiler.md`, `breaking-changes.md`
- React 21 might remove: `lifecycle.md` (if paradigm changes)
- Each version documents **what's relevant for that version**

---

## Version-Specific Documentation (React 19 Example)

### Single Source of Truth: `coding-standards.md`

**Location:** `/react-19/coding-standards.md`

**Purpose:** Authoritative quick reference for React 19 standards
**Contains:**
- Component architecture patterns
- React 19 features (use(), useActionState, useOptimistic, etc.)
- Server Components & directives
- State management approaches
- Performance optimization techniques
- TypeScript integration (optional)
- File organization standards
- Naming conventions
- Testing standards
- Code quality & tooling

**Links to:** All detailed documentation in `/react-19/docs/*`

### Deep Dive Documentation: `/react-19/docs/*`

**Purpose:** Version-specific feature documentation

**React 19 Files:**
- `overview.md` - React 19 features guide
- `hooks.md` - Built-in hooks reference
- `custom-hooks.md` - Custom hook patterns
- `patterns.md` - Best practices
- `lifecycle.md` - Hook execution timing

**Key Point:** Future React versions may have different doc files!

---

## Version Management

### Adding a New React Version

When a new React version is released (e.g., React 20):

**Step 1: Create Version Folder**
```bash
mkdir react-20
cd react-20
```

**Step 2: Bootstrap Structure**
```bash
# Option A: Start fresh
mkdir docs demo

# Option B: Copy from previous version (then modify)
cp -r ../react-19/* .
```

**Step 3: Update Documentation**
1. Update `coding-standards.md` with new version standards
2. Add/remove/modify files in `/docs/*` based on new features
3. Update demo to showcase new capabilities
4. Remove obsolete patterns
5. Add migration notes from previous version

**Step 4: Version-Specific Considerations**
- `/docs/*` files **can be completely different**
- Some versions might have fewer or more docs
- Demo apps may use different build tools
- Coding standards reflect that version's best practices
- **DO NOT** update old versions to match new patterns

**Step 5: Update Cross-Version Specs**
- Add new version to `/specs/project-spec.md`
- Update "Current Versions" section
- Add version comparison notes (if applicable)

### Version Isolation Rules

**Critical Principle:** Each version folder must be independent!

✅ **DO:**
- Keep each version completely isolated
- Use different `package.json` and dependencies per demo
- Document version-specific patterns separately
- Freeze old versions as historical reference
- Allow different doc structures per version

❌ **DON'T:**
- Cross-reference between version folders
- Share `node_modules` between demos
- Update old versions to match new patterns
- Assume docs structure is consistent across versions
- Backport new patterns to old versions

### Documentation Evolution Examples

**Example 1: Adding New Features**
```
React 19: /docs/overview.md (Server Components, Actions)
React 20: /docs/overview.md (Compiler, New Features)
          /docs/compiler.md (NEW - React Compiler deep dive)
```

**Example 2: Paradigm Shifts**
```
React 19: /docs/lifecycle.md (Hook execution order)
React 22: [File removed - no longer relevant with new paradigm]
```

**Example 3: Pattern Evolution**
```
React 18: /docs/hoc-patterns.md (HOCs common)
React 19: /docs/custom-hooks.md (Custom hooks preferred, HOCs legacy)
React 20: /docs/custom-hooks.md (Only custom hooks, HOCs deprecated)
```

---

## Current Versions

### React 19 (Active - December 2024)

**Status:** ✅ Complete

**Documentation:**
- `coding-standards.md` ✅
- `docs/overview.md` ✅ (Server Components, Actions, new hooks)
- `docs/hooks.md` ✅ (Built-in hooks guide)
- `docs/custom-hooks.md` ✅ (4 patterns + useAuth)
- `docs/patterns.md` ✅ (11 core principles)
- `docs/lifecycle.md` ✅ (Hook timing)

**Demo:** ✅ Vite + React 19.x + JavaScript

**Key Features:**
- Server Components (stable)
- Server Actions
- `use()` hook
- `useActionState`
- `useOptimistic`
- `useFormStatus`
- Custom hooks over HOCs pattern

### React 20 (Future)

**Status:** ⏳ Not yet released

**Expected:** TBD (React team hasn't announced)

**Anticipated Features:**
- React Compiler (automatic memoization)
- Performance improvements
- Potential new hooks
- Breaking changes TBD

**Docs Strategy:**
- Will add `/react-20/` folder when released
- May include `compiler.md` if React Compiler ships
- Will document migration path from React 19

### React 21+ (Future)

**Status:** ⏳ Future

**Strategy:** Add folders as versions are released

---

## Cross-Version Features

### Version Comparison (Planned)

**File:** `/specs/version-comparison.md` (not yet created)

**Will Document:**
- Feature matrix across all versions
- Migration guides (18→19, 19→20, etc.)
- Pattern evolution timeline
- Breaking changes summary
- Performance comparisons

**Example Structure:**
```markdown
# React Version Comparison

## Feature Matrix

| Feature | React 18 | React 19 | React 20 |
|---------|----------|----------|----------|
| Server Components | Beta | ✅ Stable | ✅ Enhanced |
| Custom Hooks | ✅ | ✅ Preferred | ✅ Required |
| HOCs | ✅ Common | ⚠️ Legacy | ❌ Deprecated |
| Compiler | ❌ | ❌ | ✅ Built-in |

## Migration Paths

### React 18 → 19
- Move to Server Components
- Replace HOCs with custom hooks
- Use new form hooks

### React 19 → 20
- Adopt React Compiler
- Remove manual memoization
- Update to new APIs
```

### Shared Resources

Some files are shared across all versions:

**`/specs/`** - Project-wide specifications
- `project-spec.md` - This file
- `README.md` - Specs guide
- `version-comparison.md` - (Future) Cross-version comparison

**Root Level:**
- `README.md` - Project overview and navigation
- `.gitignore` - Standard patterns
- `LICENSE` - If applicable

---

## Maintenance Guidelines

### For Existing Versions (e.g., React 19)

**Fixing Errors/Typos:**
1. Fix in the affected version's files only
2. ❌ Don't backport to older versions (they're historical)
3. ❌ Don't forward-port to newer versions (they may differ)

**Adding Examples:**
1. Add to relevant version only
2. Ensure it matches that version's patterns
3. Test with that version's React dependencies

**Example:**
```
Good: Add useAuth example to /react-19/docs/custom-hooks.md
Bad:  Add useAuth to /react-18/ (didn't exist then)
Bad:  Update /react-20/ (may have different auth pattern)
```

### For This Specification

Update `/specs/project-spec.md` when:
- Adding new React versions
- Changing repository structure
- Adding cross-version tools
- Updating maintenance guidelines
- Documenting version comparison strategies

### Review Checklist (Per Version Update)

When updating a specific React version folder:

- [ ] `coding-standards.md` updated (single source of truth)
- [ ] Relevant `/docs/*` files updated or added/removed
- [ ] Demo code reflects standards
- [ ] Internal links verified (within version)
- [ ] Examples tested with correct React version
- [ ] No unintended cross-version references
- [ ] Version number clear if ambiguous

---

## Future Enhancements

### React 19 Specific
- [ ] Add `use()` hook example to demo
- [ ] Add `useActionState` form example
- [ ] Add `useOptimistic` demo with mock server
- [ ] More custom hook patterns
- [ ] Testing examples with React Testing Library

### React 20+ Planning
- [ ] Monitor React 20 release announcements
- [ ] Plan React 20 folder structure
- [ ] Document React Compiler (if included)
- [ ] Identify breaking changes (19→20)
- [ ] Design migration guide

### Cross-Version Tools
- [ ] Create `/specs/version-comparison.md`
- [ ] Feature matrix across versions
- [ ] Migration guide generator
- [ ] Pattern evolution timeline visualization
- [ ] Automated diff highlighter between versions

### Under Consideration
- [ ] TypeScript variants (per version if beneficial)
- [ ] Next.js examples (per version)
- [ ] Remix examples (per version)
- [ ] Storybook component docs
- [ ] Performance benchmarks across versions
- [ ] Video walkthroughs

---

## Glossary

**Time Capsule** - Version-isolated documentation that doesn't change
**Version Isolation** - Each React version is completely independent
**Cross-Version** - Resources shared across all React versions
**Pattern Evolution** - How React patterns changed over time
**Migration Path** - Guide from one React version to another

**React-Specific:**
- **HOC** - Higher-Order Component (legacy pattern)
- **RSC** - React Server Components
- **SSR** - Server-Side Rendering
- **SSG** - Static Site Generation
- **SPA** - Single Page Application
- **DX** - Developer Experience
- **a11y** - Accessibility

---

## References

### Official React
- [React Docs](https://react.dev/)
- [React 19 Release](https://react.dev/blog/2024/12/05/react-19)
- [React GitHub](https://github.com/facebook/react)

### Community
- [React RFC Repository](https://github.com/reactjs/rfcs)
- [React Working Group](https://github.com/reactwg)

---

**Last Review:** 2025-10-19
**Next Review:** When React 20 is announced or major changes occur
**Spec Maintainer:** Project contributors
