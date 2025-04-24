import { supabase } from './supabaseClient';

export const syncUserToDatabase = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error fetching user:', userError);
    return;
  }

  // Step 1: Check if user already exists in DB
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // Not a "No rows found" error
    console.error('Error checking user existence:', fetchError);
    return;
  }

  if (existingUser) {
    // User already exists
    console.log('User already exists in DB.');
    return;
  }

  // Step 2: Insert user if they don't exist
  const { error: insertError } = await supabase.from('users').insert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    username: user.user_metadata?.username || '',
  });

  if (insertError) {
    console.error('Error inserting user into DB:', insertError);
  } else {
    console.log('User synced to DB.');
  }
};
