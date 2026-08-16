import { supabase } from "./supabase";

export interface PublicProfile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  activeAvatarFrame: string | null;
}

function mapProfileRow(row: any): PublicProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    activeAvatarFrame: row.active_avatar_frame,
  };
}

export async function fetchProfile(userId: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, active_avatar_frame")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapProfileRow(data);
}

export async function fetchProfiles(userIds: string[]): Promise<Record<string, PublicProfile>> {
  if (userIds.length === 0) return {};
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, active_avatar_frame")
    .in("id", userIds);
  if (error || !data) return {};
  const map: Record<string, PublicProfile> = {};
  data.forEach((row) => {
    map[row.id] = mapProfileRow(row);
  });
  return map;
}
