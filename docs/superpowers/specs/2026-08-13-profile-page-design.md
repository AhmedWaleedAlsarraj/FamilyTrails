# Profile Page Rebuild — Design

Date: 2026-08-13
Status: Approved by user, ready for planning

## Problem

The Profile screen (`src/app/screens.tsx` → `ProfileScreen`) shows real stats
(memory/place/photo counts) but its four settings buttons — Privacy Settings,
Notification Preferences, Help & Support, About FamilyTrails — have no
`onClick` handlers. The user cannot edit their name or avatar, cannot change
default memory visibility, cannot manage notifications, and there is no
accessibility support (text size, contrast, motion) anywhere in the app.

## Goals

- Every button on the profile page does something real.
- Users can edit their display name and avatar photo.
- A single Settings screen covers accessibility (text size, high contrast,
  reduce motion) and a notifications enable/disable toggle.
- A Privacy screen covers: default memory visibility, bulk visibility
  management for existing memories, data export, and account deletion.
- Help & Support and About screens exist with real static content.

## Non-goals

- Real push notification delivery (no service worker push infrastructure
  yet). The notifications toggle is a stored preference only, for a future
  subsystem to consume.
- Points/rewards system (separate design, not started).
- GPS auto-tracking improvements (separate design, not started).
- Phone number editing (out of scope per user decision — name + avatar only).

## Architecture

### New files

- `src/app/screens/ProfileScreens.tsx` — `EditProfileScreen`,
  `SettingsScreen`, `PrivacyScreen`, `HelpScreen`, `AboutScreen`. Kept
  separate from `screens.tsx` (already ~1460 lines) to avoid growing that
  file further.
- `src/app/context/AccessibilityContext.tsx` — reads/writes accessibility
  prefs to `localStorage`, exposes `textSize`, `highContrast`,
  `reduceMotion`, and setters. Sets `data-*` attributes on `<html>` for CSS
  to key off of.
- `src/app/lib/uploadAvatarFile.ts` — mirrors `uploadMemoryFile.ts`, uploads
  to the new `avatars` storage bucket at `${userId}/avatar.<ext>` with
  `upsert: true` (one avatar per user, always overwritten).
- `supabase/functions/delete-account/index.ts` — Edge Function (Deno) using
  the service-role key to delete a user's storage files, memory rows, and
  auth user record.

### Modified files

- `src/app/screens.tsx` — `ProfileScreen`'s four buttons get real
  `navigate()` calls to the new routes.
- `src/app/routes.tsx` — new routes under `/profile/*`, all behind
  `RequireAuth`.
- `src/app/App.tsx` (`AppProvider`) — add `updateMemoryVisibility(id,
  visibility)` alongside existing `addMemory`/`deleteMemory`.
- `src/app/context/AuthContext.tsx` — add `updateProfile({ fullName?,
  avatarUrl? })` and read/write `default_visibility` /
  `notifications_enabled` via `supabase.auth.updateUser({ data: {...} })`.
- `src/main.tsx` — wrap the app in `AccessibilityProvider`.
- `supabase/schema.sql` — add `avatars` bucket + RLS policies (same shape as
  the `memories` bucket), add `memories_update_own` RLS policy.
- Global stylesheet — CSS rules keyed off the `AccessibilityContext`
  `data-*` attributes (text scale, high-contrast palette, motion overrides).

## Data model

No new Postgres tables. Profile fields live in Supabase auth
`user_metadata`, consistent with how `full_name` is already stored:

| Field | Type | Where |
|---|---|---|
| `full_name` | text | `user_metadata` (existing) |
| `avatar_url` | text | `user_metadata` (new) |
| `default_visibility` | `"public" \| "private"` | `user_metadata` (new) |
| `notifications_enabled` | boolean | `user_metadata` (new) |

Accessibility prefs (`textSize`, `highContrast`, `reduceMotion`) are
device-local — `localStorage`, not synced to the backend. They're display
preferences, not account data, and don't need to follow the user across
devices for this app's scope.

### Storage

- New `avatars` bucket: public read, owner-only insert/update/delete —
  identical policy shape to the existing `memories` bucket.

### RLS changes

- `memories` currently has `select`, `insert`, `delete` policies for own
  rows but no `update` policy — needed for bulk visibility management.
  Add `memories_update_own`: `for update using (auth.uid() = user_id) with
  check (auth.uid() = user_id)`.

## Component behavior

**EditProfileScreen** — form with name field (text input) and avatar (tap to
replace, uses the same take-photo/gallery picker pattern as
`PhotoAttachmentScreen`). Save calls `updateProfile()`; on success, navigates
back to `/profile` so the new value renders immediately (per `FRONTEND.md`'s
"sync form state after save" rule — here that means re-reading `user` from
`AuthContext`, which already updates automatically since
`supabase.auth.updateUser` triggers the `onAuthStateChange` listener already
wired in `AuthContext`).

**SettingsScreen** — two sections:
1. Accessibility: text size (4-way segmented control), high contrast
   (toggle), reduce motion (toggle) — all write through
   `AccessibilityContext` immediately, no save button, since these are
   local and instant.
2. Notifications: single enable/disable toggle, calls `updateProfile()`
   on change.

**PrivacyScreen** — three sections:
1. Default visibility: same two-button picker component already used
   elsewhere (`VisibilityPicker` in `screens.tsx`, made reusable/exported),
   writes through `updateProfile()`.
2. Manage existing memories: list of the user's own **public** memories
   with a "Make private" action per row, calls the new
   `updateMemoryVisibility()`.
3. Danger zone: "Export my data" (client-side JSON blob download of all
   the user's memories) and "Delete my account" (confirmation dialog →
   `supabase.functions.invoke('delete-account')` → sign out → redirect to
   `/login`).

**HelpScreen / AboutScreen** — static content, same header/card visual
pattern as the rest of the app. No backend calls.

## Accessibility implementation notes

- Text size: CSS custom property (e.g. `--text-scale`) set on `<html>`,
  applied via a `rem`-based scale already implicit in Tailwind's default
  type scale — no per-component rewrite needed if the scale is applied at
  the root font-size level.
- High contrast: alternate CSS variable set (`--color-primary`, text/bg
  colors) behind a `[data-contrast="high"]` selector.
- Reduce motion: `AccessibilityContext`'s `reduceMotion` flag (defaulting to
  `true` if `prefers-reduced-motion: reduce` is detected, user-overridable)
  is read by a small wrapper so `motion/react` animation props collapse to
  no-op when active, rather than editing every `motion.div` individually.
- Screen reader audit: pass over existing icon-only buttons (share, delete,
  more-vertical, back arrow, close, bell) across `screens.tsx` and the new
  files, adding `aria-label`. Tracked as an implementation task, not a
  runtime toggle.

## Error handling

Every mutation (avatar upload, profile save, visibility toggle, account
deletion, data export) follows the existing codebase pattern: try/catch
around the Supabase call, inline error text near the action (no raw
Supabase/Axios error strings shown to the user), loading state disables the
relevant button while in flight.

## Deployment note (account deletion)

The Edge Function needs to be deployed via the Supabase CLI
(`supabase functions deploy delete-account`) with `SUPABASE_SERVICE_ROLE_KEY`
set as a function secret. This is a manual step for the project owner —
the function code will be written and documented, but deployment requires
the linked Supabase project and CLI auth, which the assistant cannot do on
the user's behalf without their credentials.

## Testing

No test runner exists in this project (`package.json` has no
vitest/testing-library). Given this feature is almost entirely UI +
Supabase calls, verification is a manual browser QA pass through each new
screen and flow (edit profile, each settings toggle, visibility bulk
management, export, delete account against a disposable test user) rather
than introducing a test framework for one feature.

## Open items for implementation plan

- Exact route paths under `/profile/*`.
- Whether text-size scaling needs any component-level overrides beyond the
  root variable (to be discovered during implementation).
