import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPA_BASE_TOKEN;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPA_BASE_CHAT_ID;

export const supabase = createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });