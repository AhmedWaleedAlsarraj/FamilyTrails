# Points & Rewards System — Design

Status: Approved. Cosmetic rewards only for launch (badges + avatar frames). Real-world
attraction offers are deliberately deferred but the schema is shaped so they slot in later
without a rebuild — see "Future: real-world offers" below.

## Earning rules

- Every memory (photo/video/text — flat rate, type doesn't matter) earns **2 points**.
- Capped at the **first 5 memories per day** counting toward points (max 10 pts/day per user).
- Enforced server-side by a Postgres trigger on `memories` insert, not client code — so it
  can't be bypassed by calling the Supabase REST/JS API directly instead of going through the
  app.

## Data model

```sql
-- Every earn/spend event. Append-only audit trail.
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

-- Cached running balance, kept in sync by trigger below. Avoids summing
-- the ledger on every page load.
create table if not exists user_points (
  user_id uuid primary key,
  balance integer not null default 0,
  updated_at timestamptz not null default now()
);

-- The catalog. `type` already allows 'offer' so real-world rewards slot in
-- later without a migration; `metadata` is a spare jsonb column for
-- whatever an offer needs (redemption code, partner name, expiry) that a
-- badge/frame doesn't.
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

-- What a user has redeemed. Unique per user+reward so you can't buy the
-- same badge twice.
create table if not exists user_rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  reward_id uuid not null references rewards(id),
  redeemed_at timestamptz not null default now(),
  unique (user_id, reward_id)
);

create index if not exists idx_user_rewards_user_id on user_rewards(user_id);
```

**Equipped avatar frame** is not a new table — it reuses the existing `user_metadata` pattern
already used for `defaultVisibility` / `notificationsEnabled` in `AuthContext.updateProfile`.
Adds one more optional field: `activeAvatarFrame?: string` (stores the reward `key`). Badges are
not equipped — they're just displayed as a collection.

## Row-level security

Clients get **read-only** access. No insert/update/delete policy exists for `points_ledger` or
`user_rewards` at all — the only way to write to them is through the two `security definer`
functions below, which are owned by the table owner and therefore bypass RLS. This closes the
obvious cheat path of a client inserting itself a positive ledger row directly via the JS client.

```sql
alter table points_ledger enable row level security;
alter table user_points enable row level security;
alter table rewards enable row level security;
alter table user_rewards enable row level security;

create policy points_ledger_select_own on points_ledger for select using (auth.uid() = user_id);
create policy user_points_select_own on user_points for select using (auth.uid() = user_id);
create policy rewards_public_read on rewards for select using (active = true);
create policy user_rewards_select_own on user_rewards for select using (auth.uid() = user_id);
```

## Server-side functions

```sql
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

create trigger trg_points_ledger_apply
  after insert on points_ledger
  for each row execute function apply_points_ledger_entry();

-- Awards points for a new memory, capped at 5/day. Mirrors the existing
-- increment_attraction_views RPC pattern already in schema.sql.
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
```

## Seed catalog (placeholder values — easy to retune later)

```sql
insert into rewards (type, key, name, description, cost, icon) values
  ('badge', 'badge_wanderer', 'Wanderer', 'A small token for getting started.', 15, 'Compass'),
  ('badge', 'badge_storyteller', 'Storyteller', 'For sharing your memories.', 30, 'BookOpen'),
  ('badge', 'badge_trailblazer', 'Trailblazer', 'For consistent explorers.', 75, 'Flag'),
  ('badge', 'badge_legend', 'Legend', 'The top badge.', 150, 'Trophy'),
  ('avatar_frame', 'frame_bronze', 'Bronze Frame', 'A bronze ring for your avatar.', 20, null),
  ('avatar_frame', 'frame_silver', 'Silver Frame', 'A silver ring for your avatar.', 60, null),
  ('avatar_frame', 'frame_gold', 'Gold Frame', 'A gold ring for your avatar.', 120, null)
on conflict (key) do nothing;
```

At 10 pts/day max, the cheapest badge/frame (15/20 pts) is reachable in ~2 days, the top badge
(150 pts) takes ~2-3 weeks of daily use — gives a sense of progression without being a grind for
a demo.

## Frontend changes

- `src/app/context/RewardsContext.tsx` (new) — fetches `user_points` balance, the `rewards`
  catalog, and the user's `user_rewards`; exposes `redeemReward(rewardId)` calling
  `supabase.rpc('redeem_reward', { p_reward_id })`. Follows the same provider pattern as
  `AppContext`/`AccessibilityContext`.
- `src/app/ProfileScreens.tsx` — new `RewardsScreen` export, reusing the existing
  `ScreenHeader`/`SettingsRow`-style patterns already in this file. Shows balance at top, then
  two sections: Badges (grid of owned/locked icons) and Avatar Frames (grid with an "Equip"
  action on owned ones).
- `ProfileScreen` (in `screens.tsx`) — add a points-balance chip near the avatar that links to
  `/profile/rewards`.
- Router — register `/profile/rewards` alongside the existing `/profile/edit`, `/profile/settings`
  etc. sub-routes.
- `EditProfileScreen` — render the equipped avatar frame (if any) around the avatar preview.
- `AuthContext.updateProfile` — add `activeAvatarFrame?: string` to the updates type, mapped to
  `active_avatar_frame` in `user_metadata`, same as the other fields.

## Future: real-world offers (not built now)

When ready to add real attraction offers, this schema needs no structural change:
- Seed `rewards` rows with `type = 'offer'` and put offer-specific fields (redemption code,
  partner name, expiry) in the existing `metadata` jsonb column.
- Add an "Offers" section to `RewardsScreen` alongside Badges/Frames.
- Redemption still goes through `redeem_reward` unchanged — it doesn't care what type it's
  granting.

No dead code is being written for this now — just a `type` value and a spare column reserved.
