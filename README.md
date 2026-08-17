# MegaSort — File Management System

MegaSort is a React + TypeScript + Supabase file organizer designed for bulk uploads (500+ files).

## Included in this recreated project

- Bulk upload queue with 4 concurrent uploads
- Automatic Images / Documents / Videos / Audio / Archives / Code / Other classification
- SHA-256 duplicate detection
- Needs Review for low-confidence file types
- Supabase Auth
- Private Supabase Storage bucket
- Per-user Row Level Security
- My Files search and category filters
- Download and soft-delete
- Trash / restore / permanent delete
- Tags
- Dashboard analytics
- CSV and PDF export
- Ctrl/Cmd + K command palette
- Light/dark mode
- Guest/local mode when Supabase environment variables are not configured

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

Copy `.env.example` to `.env` and set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Then open Supabase SQL Editor and run:

```text
supabase/migrations/001_megasort.sql
```

This creates the database tables, RLS policies, and the private `megasort-files` Storage bucket.

## 3. Run

```bash
npm run dev
```

## 4. Verify

```bash
npm run typecheck
npm run build
```

## 5. Vercel

Set the same two environment variables in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then redeploy.

### Important

Do not put the Supabase service-role key in the frontend. Only use the public anon/publishable key in `VITE_SUPABASE_ANON_KEY`.

The uploaded file contents remain in Supabase Storage. The `files` table stores metadata such as name, category, size, hash and storage path.

## Project structure

```text
src/
  components/
  context/
  lib/
  pages/
  App.tsx
  main.tsx
  styles.css

supabase/
  migrations/
    001_megasort.sql
```MegaSort 2.0 deployment
