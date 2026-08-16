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
-- Points & Rewards system (already live)
-- ============================================================
--
-- Cosmetic rewards only for now (badges + avatar frames). `rewards.type`
-- already allows 'offer' and there's a spare `metadata` jsonb column, so
-- real-world attraction offers can be added later as data, not a migration.
-- See docs/superpowers/specs/2026-08-13-points-rewards-system-design.md
-- for the full rationale.

create table if not exists points_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  delta integer not null,
  reason text not null check (reason in ('memory_added', 'reward_redeemed')),
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_points_ledger_user_id on points_ledger(user_id);
create index if not exists idx_points_ledger_user_reason_created
  on points_ledger(user_id, reason, created_at);

create table if not exists user_points (
  user_id uuid primary key,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('badge', 'avatar_frame', 'offer')),
  key text not null unique,
  name text not null,
  description text,
  cost integer not null,
  icon text,
  metadata jsonb not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  reward_id uuid not null references rewards(id),
  redeemed_at timestamptz not null default now(),
  unique (user_id, reward_id)
);

create index if not exists idx_user_rewards_user_id on user_rewards(user_id);

alter table points_ledger enable row level security;
alter table user_points enable row level security;
alter table rewards enable row level security;
alter table user_rewards enable row level security;

-- Clients get read-only access. No insert/update/delete policy exists for
-- points_ledger or user_rewards at all — the only writers are the
-- security-definer functions below, which bypass RLS as the table owner.
-- This closes the obvious cheat path of a client inserting itself a
-- positive ledger row directly via the JS client.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'points_ledger' and policyname = 'points_ledger_select_own'
  ) then
    create policy points_ledger_select_own on points_ledger for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'user_points' and policyname = 'user_points_select_own'
  ) then
    create policy user_points_select_own on user_points for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'rewards' and policyname = 'rewards_public_read'
  ) then
    create policy rewards_public_read on rewards for select using (active = true);
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'user_rewards' and policyname = 'user_rewards_select_own'
  ) then
    create policy user_rewards_select_own on user_rewards for select using (auth.uid() = user_id);
  end if;
end $$;

-- Keeps user_points in sync with points_ledger, atomically.
create or replace function apply_points_ledger_entry()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into user_points (user_id, balance, updated_at)
  values (new.user_id, new.delta, now())
  on conflict (user_id) do update
    set balance = user_points.balance + new.delta,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_points_ledger_apply on points_ledger;
create trigger trg_points_ledger_apply
  after insert on points_ledger
  for each row execute function apply_points_ledger_entry();

-- Awards 2 points per memory, capped at the first 5 memories/day. Runs
-- server-side so it can't be bypassed by calling the Supabase API directly.
create or replace function award_memory_points()
returns trigger
language plpgsql
security definer
as $$
declare
  todays_count integer;
begin
  select count(*) into todays_count
  from points_ledger
  where user_id = new.user_id
    and reason = 'memory_added'
    and created_at >= date_trunc('day', now());

  if todays_count < 5 then
    insert into points_ledger (user_id, delta, reason, reference_id)
    values (new.user_id, 2, 'memory_added', new.id::text);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_memories_award_points on memories;
create trigger trg_memories_award_points
  after insert on memories
  for each row execute function award_memory_points();

-- Redeems a reward: validates balance + ownership, then spends + grants
-- atomically in one transaction (Postgres functions are implicitly
-- transactional).
create or replace function redeem_reward(p_reward_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  reward_cost integer;
  current_balance integer;
begin
  select cost into reward_cost from rewards where id = p_reward_id and active = true;
  if reward_cost is null then
    raise exception 'Reward not found';
  end if;

  if exists (
    select 1 from user_rewards where user_id = auth.uid() and reward_id = p_reward_id
  ) then
    raise exception 'Reward already owned';
  end if;

  select coalesce(balance, 0) into current_balance from user_points where user_id = auth.uid();
  if coalesce(current_balance, 0) < reward_cost then
    raise exception 'Not enough points';
  end if;

  insert into user_rewards (user_id, reward_id) values (auth.uid(), p_reward_id);
  insert into points_ledger (user_id, delta, reason, reference_id)
  values (auth.uid(), -reward_cost, 'reward_redeemed', p_reward_id::text);
end;
$$;

grant execute on function redeem_reward(uuid) to authenticated;

-- Starter catalog. At 10 pts/day max, cheapest item is ~2 days away, the
-- top badge is ~2-3 weeks — tune costs freely later, this is a placeholder.
insert into rewards (type, key, name, description, cost, icon) values
  ('badge', 'badge_wanderer', 'Wanderer', 'A small token for getting started.', 15, 'Compass'),
  ('badge', 'badge_storyteller', 'Storyteller', 'For sharing your memories.', 30, 'BookOpen'),
  ('badge', 'badge_trailblazer', 'Trailblazer', 'For consistent explorers.', 75, 'Flag'),
  ('badge', 'badge_legend', 'Legend', 'The top badge.', 150, 'Trophy'),
  ('avatar_frame', 'frame_bronze', 'Bronze Frame', 'A bronze ring for your avatar.', 20, null),
  ('avatar_frame', 'frame_silver', 'Silver Frame', 'A silver ring for your avatar.', 60, null),
  ('avatar_frame', 'frame_gold', 'Gold Frame', 'A gold ring for your avatar.', 120, null)
on conflict (key) do nothing;

-- ============================================================
-- Public profiles projection (already live)
-- ============================================================
--
-- NOTE: the base `profiles` table (id, full_name, phone_number,
-- created_at) and the `on_auth_user_created` trigger -> handle_new_user()
-- that populates it at signup predate this file and aren't reproduced
-- here — they were set up directly in the dashboard during the earlier
-- Supabase auth migration. What follows only ADDS to that table.
--
-- avatar_url/active_avatar_frame were missing from the original signup
-- trigger, and that trigger only fires on INSERT — so profile edits after
-- signup never propagated anywhere other users could see. This adds the
-- missing columns plus an INSERT-OR-UPDATE trigger so avatar/frame
-- changes stay live, and opens read access so memory cards and public
-- profile pages can show any user's current avatar/frame/badges.

alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists active_avatar_frame text;
alter table profiles add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'profiles' and policyname = 'profiles_public_read'
  ) then
    create policy profiles_public_read on profiles for select using (true);
  end if;
end $$;

create or replace function sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, full_name, avatar_url, active_avatar_frame, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'active_avatar_frame',
    now()
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        avatar_url = excluded.avatar_url,
        active_avatar_frame = excluded.active_avatar_frame,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_sync_profile_on_auth_user_change on auth.users;
create trigger trg_sync_profile_on_auth_user_change
  after insert or update on auth.users
  for each row execute function sync_profile_from_auth_user();

-- Backfill: fills avatar_url/active_avatar_frame for existing users for
-- the first time (the old trigger never set these columns).
insert into profiles (id, full_name, avatar_url, active_avatar_frame)
select
  id,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  raw_user_meta_data->>'active_avatar_frame'
from auth.users
on conflict (id) do update
  set full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      active_avatar_frame = excluded.active_avatar_frame,
      updated_at = now();

-- Badges must be publicly visible for the public profile screen, so
-- loosen user_rewards read access from own-only to everyone.
drop policy if exists user_rewards_select_own on user_rewards;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_rewards' and policyname = 'user_rewards_select_public'
  ) then
    create policy user_rewards_select_public on user_rewards for select using (true);
  end if;
end $$;

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
