export const TEST_REQUIREMENTS = `
# Technical Assessment - Feedback Board

**Stack:** Next.js 14+ (App Router) - TypeScript - Prisma - Supabase - shadcn/ui - Tailwind CSS
**Time:** 1 hr 30 min (10 min reading - 70 min coding - 10 min submission)

---

## Overview

Build a **Feedback Board** for a product team - a place where users submit feedback about a product, report issues, and suggest improvements. Think of it like a simplified Canny or UserVoice.

Each post is categorized as a **bug** (something broken), **feature** (a new request), or **improvement** (an enhancement to something existing). Posts also have a status - **open** (new/unaddressed), **in_progress** (being worked on), or **closed** (resolved/shipped). The post author can update their own post's status.

Authenticated users can create, edit, and delete their own posts with optional file attachments stored in Supabase Storage. Access control **must** use Row Level Security (RLS) at the database level. Use Supabase Auth for authentication.

---

## Data Model

You need two tables:

### \`profiles\` table

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, references \`auth.users.id\` |
| username | text | Unique, required |
| full_name | text | Required |
| avatar_url | text | Optional - profile picture URL |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |

Create a profile automatically when a user signs up (use a database trigger or handle it in your sign-up flow). Display the username/full name on posts instead of just the email.

### \`posts\` table

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, auto-generated |
| title | text | Required |
| description | text | Required |
| category | text | \`bug\`, \`feature\`, or \`improvement\` |
| status | text | \`open\`, \`in_progress\`, or \`closed\` (default \`open\`) |
| attachment_url | text | Optional - Supabase Storage URL |
| author_id | UUID | References \`profiles.id\` |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-updated |

---

## Required Features

### 1. Auth & Profiles
- Email/password sign up, sign in, sign out
- On sign up, collect username and full name to create a profile
- Show the current user's name/username in the UI
- Display author name on posts (not just email)

### 2. Create Post
- Title, description, category (required)
- Optional file attachment (image or PDF, max 5MB) - show inline preview if image

### 3. Read Posts
- **Publicly visible** (even logged-out users can view)
- Show: title, category, status, author name, date, image preview
- Filter by category - sort by newest/oldest

### 4. Update Post
- **Own posts only** (enforced via RLS, not just UI)
- Editable: title, description, category, status, attachment

### 5. Delete Post
- **Own posts only** (enforced via RLS)
- Must also delete the attachment from Storage (no orphaned files)

### 6. RLS Policies (Mandatory)

**profiles table:**

| Operation | Rule |
|---|---|
| SELECT | Public - anyone can read profiles |
| INSERT | Auth required, \`id = auth.uid()\` |
| UPDATE | Own profile only (\`id = auth.uid()\`) |

**posts table:**

| Operation | Rule |
|---|---|
| SELECT | Public - anyone can read |
| INSERT | Auth required, \`author_id = auth.uid()\` |
| UPDATE | Post author only |
| DELETE | Post author only |

### 7. Storage Bucket
- Auth users can upload - anyone can read - only owner can delete

### 8. UI
- Use **shadcn/ui** + **Tailwind CSS** throughout
- Toast notifications on all actions (success/error)
- Loading states - no blank screens
- Image previews must display inline and not break layout

---

## Bonus (Optional)

Not required, but earns extra credit if done well:

- **Realtime** - live updates via Supabase subscriptions
- **Dark mode** - persisted theme toggle
- **Full-text search** - Postgres full-text > client-side filter
- **Mobile responsive** - genuinely good, not just "doesn't break"
- **Creative additions** - anything showing initiative

---

## Submission

Use the form below to submit:

1. **GitHub URL** - public repo with complete source code
2. **Environment Variables** - all keys needed to run (Supabase URL, anon key, etc.)
3. **App Credentials** - email/password for a test account in your app
4. **Summary** - what you built, known issues, what you'd improve

---

## How We Assess

### Completeness (Pass/Fail)
Does CRUD work end-to-end? Can we clone, set env vars, and run it without errors?

### RLS (Critical)
We inspect your Supabase dashboard directly. Policies must exist with real conditions on both profiles and posts tables. UI-only checks don't count. We test cross-user edit/delete - it must fail at the DB level.

**Instant fail:** RLS disabled, permissive policies with no conditions, or ownership checks only in frontend code.

### Storage
Files upload, display as previews, and get cleaned up on post delete. Bucket has proper policies. 5MB limit enforced.

### UI Quality
shadcn/ui used properly, consistent design, toast feedback, loading states, working filters/sort, no layout breaks.

### Code Quality
Clean TypeScript (no \`any\` abuse), logical file structure, proper server/client separation, no exposed secrets, clean Prisma schema with proper relations between profiles and posts.

### Error Handling
Empty form submissions, failed uploads, logged-out actions, network errors - all handled with helpful messages.

### Bonus Features
Only if done well. Half-broken realtime is worse than none.

---

## Rules

- You **may** use AI tools - we evaluate understanding, not just output
- You **may** use docs (Next.js, Prisma, Supabase, shadcn/ui, Tailwind)
- You **may not** use pre-built templates that implement core features
- Timer starts on first login and cannot be paused
- Late submissions will not be accepted

Good luck.
`
