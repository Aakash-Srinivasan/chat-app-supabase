import { supabase } from "./supabaseClient";

export const fetchUsers = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Error getting current user:", authError);
    return [];
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url")
    .neq("id", user.id); // exclude current user

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data;
};
