# MegaSort

An AI-assisted file sorting and organization web app — upload files and MegaSort
classifies, tags, deduplicates, and organizes them automatically. Built with
React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

- Drag-and-drop upload with automatic classification (Images, Documents, Videos,
  Audio, Archives, Other) and confidence scoring
- Smart Albums, duplicate detection, and a "Needs Review" queue for low-confidence files
- Tags — create color-coded tags and apply them to files individually or in bulk
- Trash / Recycle Bin — soft delete with a 30-day restore window
- Storage analytics dashboard and a full activity log
- CSV and PDF export of your file listing
- Command palette (`Cmd+K` / `Ctrl+K`) for fast keyboard navigation
- Light/dark theme

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- Supabase (Postgres database, Auth, and Storage)

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run the two files in `supabase/migrations/` in order
   (they create the `files`, `folders`, `tags`, `file_tags`, `duplicate_groups`,
   `activity_logs`, `processing_jobs`, and `app_settings` tables plus Row Level
   Security policies and a Storage bucket).
3. Copy `.env.example` to `.env` and fill in your project's URL and anon key
   (found in Supabase under Project Settings → API):

```bash
cp .env.example .env
```

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy it to any static host (Vercel, Netlify,
Cloudflare Pages, etc.), setting the same two environment variables in the
host's dashboard.

## Project structure

```
src/
  components/   Shared UI components (buttons, cards, dialogs, layout, command palette)
  context/      React context providers (auth, theme, toasts)
  lib/          Business logic — file service, classification, tags, export, hashing
  pages/        Top-level pages (Dashboard, Upload, My Files, Tags, Trash, Settings, ...)
supabase/
  migrations/   SQL schema and Row Level Security policies
```

See `ADDONS_CHANGELOG.md` for a log of features added on top of the original build.

## License

Personal / educational project.


## Local startup fix

If the app previously showed a blank screen when `.env` was missing, this version now falls back safely to the landing page. Configure Supabase with `.env` to enable authentication, database, and storage features.

## Authentication / Vercel setup

MegaSort uses Supabase Auth. The frontend expects these Vite environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

For a Vercel deployment, add both variables under **Project Settings → Environment Variables** and enable them for **Production** (and Preview if needed). Then create a new deployment; Vercel does not apply changed environment variables to previous deployments.

In Supabase, run the SQL files in `supabase/migrations/` in order. If email confirmation is enabled, a newly registered user must confirm their email before signing in.
