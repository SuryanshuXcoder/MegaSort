-- MegaSort production schema
create extension if not exists pgcrypto;

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime_type text default '',
  size bigint not null default 0,
  category text not null default 'Other',
  extension text default '',
  hash text,
  confidence numeric not null default 0.5,
  status text not null default 'organized',
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists files_user_created_idx on public.files(user_id, created_at desc);
create index if not exists files_user_hash_idx on public.files(user_id, hash);
create index if not exists files_user_category_idx on public.files(user_id, category);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.file_tags (
  file_id uuid not null references public.files(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key(file_id, tag_id)
);


create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_id uuid references public.folders(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, parent_id, name)
);

create table if not exists public.duplicate_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  file_id uuid references public.files(id) on delete set null,
  file_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total integer not null default 0,
  completed integer not null default 0,
  failed integer not null default 0,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.files enable row level security;
alter table public.folders enable row level security;
alter table public.duplicate_groups enable row level security;
alter table public.tags enable row level security;
alter table public.file_tags enable row level security;
alter table public.activity_logs enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "files_select_own" on public.files;
drop policy if exists "files_insert_own" on public.files;
drop policy if exists "files_update_own" on public.files;
drop policy if exists "files_delete_own" on public.files;
create policy "files_select_own" on public.files for select using (auth.uid() = user_id);
create policy "files_insert_own" on public.files for insert with check (auth.uid() = user_id);
create policy "files_update_own" on public.files for update using (auth.uid() = user_id);
create policy "files_delete_own" on public.files for delete using (auth.uid() = user_id);


drop policy if exists "folders_own" on public.folders;
create policy "folders_own" on public.folders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "duplicate_groups_own" on public.duplicate_groups;
create policy "duplicate_groups_own" on public.duplicate_groups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tags_all_own" on public.tags;
create policy "tags_all_own" on public.tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "file_tags_select_own" on public.file_tags;
drop policy if exists "file_tags_insert_own" on public.file_tags;
drop policy if exists "file_tags_delete_own" on public.file_tags;
create policy "file_tags_select_own" on public.file_tags for select using (
  exists(select 1 from public.files f where f.id = file_id and f.user_id = auth.uid())
);
create policy "file_tags_insert_own" on public.file_tags for insert with check (
  exists(select 1 from public.files f where f.id = file_id and f.user_id = auth.uid())
  and exists(select 1 from public.tags t where t.id = tag_id and t.user_id = auth.uid())
);
create policy "file_tags_delete_own" on public.file_tags for delete using (
  exists(select 1 from public.files f where f.id = file_id and f.user_id = auth.uid())
);

drop policy if exists "activity_own" on public.activity_logs;
create policy "activity_own" on public.activity_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "jobs_own" on public.processing_jobs;
create policy "jobs_own" on public.processing_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "settings_own" on public.app_settings;
create policy "settings_own" on public.app_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('megasort-files', 'megasort-files', false)
on conflict (id) do nothing;

drop policy if exists "storage_select_own" on storage.objects;
drop policy if exists "storage_insert_own" on storage.objects;
drop policy if exists "storage_update_own" on storage.objects;
drop policy if exists "storage_delete_own" on storage.objects;

create policy "storage_select_own" on storage.objects for select using (
  bucket_id = 'megasort-files' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "storage_insert_own" on storage.objects for insert with check (
  bucket_id = 'megasort-files' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "storage_update_own" on storage.objects for update using (
  bucket_id = 'megasort-files' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "storage_delete_own" on storage.objects for delete using (
  bucket_id = 'megasort-files' and (storage.foldername(name))[1] = auth.uid()::text
);
