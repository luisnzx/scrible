// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// ⚠️ REPLACE THESE WITH YOUR SUPABASE PROJECT VALUES
const SUPABASE_URL = 'https://aghvxawppzjajmfajlnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnaHZ4YXdwcHpqYWptZmFqbG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjIwMzMsImV4cCI6MjA5NjM5ODAzM30.tRVeRhRpzacHwiijxvjv88xuvQGvt9WwzcrNc0amEts';

const isWeb = Platform.OS === 'web';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (isWeb) {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch (e) {
        return Promise.resolve(null);
      }
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (isWeb) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
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
