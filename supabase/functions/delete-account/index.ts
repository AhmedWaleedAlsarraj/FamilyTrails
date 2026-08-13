// Supabase Edge Function — permanently deletes the calling user's account.
//
// Deploy with: supabase functions deploy delete-account
//
// SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are
// injected automatically by the Supabase platform for every Edge Function —
// no manual secret configuration needed.
//
// Called from the client via `supabase.functions.invoke("delete-account")`,
// which forwards the caller's JWT in the Authorization header automatically.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function deleteBucketFolder(client: SupabaseClient, bucket: string, userId: string) {
  const { data: files } = await client.storage.from(bucket).list(userId);
  if (files && files.length > 0) {
    const paths = files.map((f) => `${userId}/${f.name}`);
    await client.storage.from(bucket).remove(paths);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Identify the caller from their own JWT — never trust a user id from the
  // request body, since that would let anyone delete any account.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Privileged client for the actual deletion — the anon key can't delete
  // other users' data or auth records, only the service role can.
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  await deleteBucketFolder(adminClient, "memories", user.id);
  await deleteBucketFolder(adminClient, "avatars", user.id);

  const { error: memoriesError } = await adminClient.from("memories").delete().eq("user_id", user.id);
  if (memoriesError) {
    return new Response(JSON.stringify({ error: memoriesError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    return new Response(JSON.stringify({ error: deleteUserError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
