// Supabase Edge Function: send-notification
// Deploy this function to your Supabase project:
//   supabase functions deploy send-notification
//
// Set up a Database Webhook in Supabase Dashboard:
//   - Table: messages
//   - Events: INSERT
//   - URL: https://YOUR_PROJECT.supabase.co/functions/v1/send-notification

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: {
    id: string;
    sender_id: string;
    receiver_id: string;
    type: string;
    content: string | null;
    media_url: string | null;
    created_at: string;
  };
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const message = payload.record;

    // Create Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get receiver's push token and sender's name
    const [receiverResult, senderResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('expo_push_token, display_name')
        .eq('id', message.receiver_id)
        .single(),
      supabase
        .from('profiles')
        .select('display_name')
        .eq('id', message.sender_id)
        .single(),
    ]);

    const pushToken = receiverResult.data?.expo_push_token;
    const senderName = senderResult.data?.display_name || 'Tu pareja';

    if (!pushToken) {
      return new Response(
        JSON.stringify({ error: 'No push token found' }),
        { status: 200 }
      );
    }

    // Build notification content
    let title = `💕 ${senderName}`;
    let body = '';

    switch (message.type) {
      case 'text':
        body = message.content || '';
        break;
      case 'drawing':
        body = '🎨 Te envió un dibujo';
        break;
      case 'photo':
        body = '📸 Te envió una foto';
        break;
      case 'sticker':
        body = `${message.content || '😍'} Te envió un sticker`;
        break;
    }

    // Send push notification
    const pushPayload: any = {
      to: pushToken,
      title,
      body,
      sound: 'default',
      priority: 'high',
      channelId: 'scrible',
      data: {
        messageId: message.id,
        type: message.type,
        senderId: message.sender_id,
      },
    };

    // Include image in notification if it's a drawing or photo
    if (message.media_url && (message.type === 'drawing' || message.type === 'photo')) {
      pushPayload.richContent = {
        image: message.media_url,
      };
    }

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(pushPayload),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
