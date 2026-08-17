# MegaSort — Add-ons & Fixes Changelog

## Bug fix
- Fixed a broken production build: `FileManager.tsx` was importing `getFolders`/`createFolder`
  from the wrong module (`fileService` instead of `folders`), which crashed `npm run build`.
- Fixed 3 pre-existing TypeScript errors (`demoData.ts` nullable fields, `hashing.ts` using a
  non-existent `Math.bitcount`, `StorageAnalytics.tsx` referencing an undefined variable).

## New: Tags
- Full tag system wired up to the `tags` / `file_tags` tables that already existed in your schema
  but had no UI.
- New **Tags** page (sidebar) — create/rename/delete color-coded tags, see usage counts.
- **Apply Tag** bulk action in My Files — select files, apply a tag to all of them at once.
- `src/lib/tags.ts` — new service layer (getTags, createTag, renameTag, deleteTag,
  getFileTagsMap, assignTag, removeTag, assignTagToFiles).

## New: Trash / Recycle Bin
- New **Trash** page (sidebar) — lists soft-deleted files with a days-until-permanent-purge
  countdown (30-day policy), multi-select restore, per-file restore/delete-forever, and an
  "Empty Trash" action. Uses the existing `getDeletedFiles` / `restoreFile` /
  `permanentDeleteFile` functions that were already in `fileService.ts` but had no page.

## New: Command Palette
- Press `Cmd+K` / `Ctrl+K` anywhere in the app to open a fast, keyboard-navigable command palette:
  jump to any page or toggle the theme without touching the mouse.
- Search bar in the top bar now shows a `⌘K` hint.

## New: PDF export
- `exportPDF()` added to `src/lib/export.ts` (using `jspdf`) — exports the current file list as a
  formatted, paginated PDF table.
- My Files toolbar now has an **Export** menu with "Export as CSV" and "Export as PDF".

## Running it
```
npm install
npm run dev       # local dev server
npm run build     # production build (verified working)
npm run typecheck # verified clean
```
Supabase credentials are already in `.env`. The `supabase/migrations` folder has the full schema —
run those migrations against your Supabase project if you're pointing at a fresh instance.

## MegaSort UI 2.0
- Premium dashboard hero and library health
- Clickable duplicate center with SHA-256 groups
- File format badges and MIME details
- Smart upload preflight classification
- Refined responsive light/dark interface
- Production email confirmation redirects to current site origin
