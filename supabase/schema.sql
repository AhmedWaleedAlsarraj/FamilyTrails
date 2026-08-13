-- FamilyTrails / bh_app — Supabase schema reference
--
-- This file documents the live schema in the project's Supabase instance
-- (qzwuhuvuyaoffvkqslzj) so the backend setup is reproducible from git
-- instead of only existing in the Supabase dashboard.
--
-- Safe to re-run: every statement is guarded (IF NOT EXISTS / existence
-- checks), so running this against the already-configured project will not
-- touch existing tables, data, or policies. The only part that is NOT yet
-- live is the "memories" storage bucket + its policies at the bottom of
-- this file — run this whole script once in the Supabase SQL editor to
-- create it.

-- ============================================================
-- Tables (already live — kept here for documentation/reproducibility)
-- ============================================================

create table if not exists attractions (
  id text primary key,
  name text not null,
  category text not null,
  distance text,
  country text not null,
  country_code text not null,
  latitude numeric not null,
  longitude numeric not null,
  description text not null,
  full_description text not null,
  image_url text not null,
  location text not null,
  rating numeric,
  views integer not null default 0,
  built text,
  height text,
  access text,
  open_hours text,
  entry text,
  features text[],
  created_at timestamptz not null default now()
);

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  poi_id text not null references attractions(id),
  poi_name text not null,
  type text not null check (type in ('photo', 'video', 'text')),
  content text not null,
  caption text,
  visibility text not null check (visibility in ('public', 'private')),
  author_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_memories_poi_id on memories(poi_id);
create index if not exists idx_memories_user_id on memories(user_id);

alter table attractions enable row level security;
alter table memories enable row level security;

-- Attractions are public read-only data (no writes from the client).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'attractions' and policyname = 'attractions_public_read'
  ) then
    create policy attractions_public_read on attractions
      for select using (true);
  end if;
end $$;

-- Memories: everyone can read public ones; owners can read/write their own.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'memories' and policyname = 'memories_select_own_or_public'
  ) then
    create policy memories_select_own_or_public on memories
      for select using (visibility = 'public' or auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'memories' and policyname = 'memories_insert_own'
  ) then
    create policy memories_insert_own on memories
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'memories' and policyname = 'memories_delete_own'
  ) then
    create policy memories_delete_own on memories
      for delete using (auth.uid() = user_id);
  end if;

  -- Needed for the profile page's "manage existing memories' visibility" tool.
  if not exists (
    select 1 from pg_policies
    where tablename = 'memories' and policyname = 'memories_update_own'
  ) then
    create policy memories_update_own on memories
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- RPC used by the "views" counter on the POI detail screen.
create or replace function increment_attraction_views(attraction_id text)
returns void
language sql
as $$
  update attractions set views = views + 1 where id = attraction_id;
$$;

-- ============================================================
-- Storage bucket for memory photos/videos — NOT YET CREATED.
-- uploadMemoryFile.ts uploads to a bucket named "memories" under a
-- `${userId}/...` path. Run this section to create it.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do nothing;

-- Anyone can view files (bucket is public, matches memories.visibility
-- being enforced at the app/table level, not the storage level).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'memories_bucket_public_read'
  ) then
    create policy memories_bucket_public_read on storage.objects
      for select using (bucket_id = 'memories');
  end if;

  -- Uploads must go into the uploader's own folder: `${auth.uid()}/...`
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'memories_bucket_owner_upload'
  ) then
    create policy memories_bucket_owner_upload on storage.objects
      for insert with check (
        bucket_id = 'memories'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'memories_bucket_owner_delete'
  ) then
    create policy memories_bucket_owner_delete on storage.objects
      for delete using (
        bucket_id = 'memories'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;

-- ============================================================
-- Storage bucket for profile avatars — NOT YET CREATED.
-- uploadAvatarFile.ts uploads to a bucket named "avatars" under a
-- `${userId}/...` path. Run this section to create it.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'avatars_bucket_public_read'
  ) then
    create policy avatars_bucket_public_read on storage.objects
      for select using (bucket_id = 'avatars');
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'avatars_bucket_owner_upload'
  ) then
    create policy avatars_bucket_owner_upload on storage.objects
      for insert with check (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  -- Avatars use upsert (one file per user, overwritten on change), which
  -- requires UPDATE permission on the existing storage object too.
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'avatars_bucket_owner_update'
  ) then
    create policy avatars_bucket_owner_update on storage.objects
      for update using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'objects' and schemaname = 'storage'
      and policyname = 'avatars_bucket_owner_delete'
  ) then
    create policy avatars_bucket_owner_delete on storage.objects
      for delete using (
        bucket_id = 'avatars'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;
