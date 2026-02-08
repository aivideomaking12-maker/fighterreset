import { supabase } from "./supabase";

export async function loadUserState(userId: string) {
  const { data, error } = await supabase
    .from("user_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.data ?? null;
}

export async function saveUserState(userId: string, state: any) {
  const { error } = await supabase.from("user_state").upsert({
    user_id: userId,
    data: state,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}
