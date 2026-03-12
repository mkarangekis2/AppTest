import type { SupabaseClient } from "@supabase/supabase-js";

type DbClient = SupabaseClient<any, "public", any>;

export async function getPrimaryCompany(supabase: DbClient, userId: string) {
  const { data } = await supabase
    .from("companies")
    .select("id,name,industry,created_at")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data || null;
}
