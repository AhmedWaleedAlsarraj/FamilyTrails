import { supabase } from "./supabase";

/**
 * Uploads a profile photo to the `avatars` storage bucket under the
 * current user's own folder (required by the RLS policy in schema.sql).
 * Always overwrites the same path (`upsert: true`) since a user has at
 * most one avatar, and returns a public URL to store on the auth user.
 */
export async function uploadAvatarFile(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Public URLs are cached aggressively by browsers; a cache-busting query
  // param ensures a newly uploaded avatar shows up immediately everywhere.
  return `${data.publicUrl}?t=${Date.now()}`;
}
