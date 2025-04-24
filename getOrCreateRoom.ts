import { supabase } from "./supabaseClient";

export const createOrGetRoom = async (selectedUserId: string) => {
  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !currentUser) throw new Error("Authentication failed");

  // 1. Check if a room already exists with these two users
  const { data: existingRooms, error: roomCheckError } = await supabase
    .rpc("get_or_create_room", {
      user1_id: currentUser.id,
      user2_id: selectedUserId,
    });

  if (roomCheckError) throw roomCheckError;

  return existingRooms[0]; // return the room object
};
