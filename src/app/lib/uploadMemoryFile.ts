import { supabase } from "./supabase";

/**
 * Uploads a photo/video/audio file to the `memories` storage bucket under
 * the current user's own folder (required by the RLS policy in schema.sql),
 * and returns a public URL to store on the memory row.
 */
export async function uploadMemoryFile(
  userId: string,
  poiId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${poiId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("memories").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("memories").getPublicUrl(path);
  return data.publicUrl;
}
