import 'react-native-url-polyfill/dist/polyfill';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// ⚠️ REPLACE THESE WITH YOUR SUPABASE PROJECT VALUES
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  partner_id: string | null;
  expo_push_token: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  type: 'text' | 'drawing' | 'photo' | 'sticker';
  content: string | null;
  media_url: string | null;
  seen: boolean;
  created_at: string;
}
