import { useState, useEffect, useCallback } from 'react';
import { supabase, type Profile, type Message } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

// ============================================================
// Auth Hook
// ============================================================
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { session, loading, signIn, signUp, signOut };
}

// ============================================================
// Profile Hook
// ============================================================
export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data);

      // Fetch partner if linked
      if (data.partner_id) {
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.partner_id)
          .single();
        setPartner(partnerData);
      }
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, partner, loading, refetch: fetchProfile };
}

// ============================================================
// Messages Hook
// ============================================================
export function useMessages(userId: string | undefined, partnerId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!userId || !partnerId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
      )
      .order('created_at', { ascending: true })
      .limit(100);

    if (data && !error) {
      setMessages(data);
    }
    setLoading(false);
  }, [userId, partnerId]);

  // Real-time subscription
  useEffect(() => {
    if (!userId || !partnerId) return;

    fetchMessages();

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, partnerId, fetchMessages]);

  const sendMessage = async (
    type: Message['type'],
    content: string | null,
    mediaUrl: string | null
  ) => {
    if (!userId || !partnerId) return;

    const { data, error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: partnerId,
      type,
      content,
      media_url: mediaUrl,
      seen: false,
    }).select().single();

    if (data && !error) {
      setMessages((prev) => [...prev, data]);
    }

    return { data, error };
  };

  const markAsSeen = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ seen: true })
      .eq('id', messageId);
  };

  return { messages, loading, sendMessage, markAsSeen, refetch: fetchMessages };
}
