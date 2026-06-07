import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth, useProfile, useMessages } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import { Message } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import * as Haptics from 'expo-haptics';

// Sticker sets
const STICKERS = [
  '❤️', '💕', '💖', '💗', '💓', '💞', '💘', '💝',
  '🥰', '😘', '😍', '🤗', '😊', '🥺', '😻', '💋',
  '🌹', '🌸', '✨', '⭐', '🌙', '☀️', '🦋', '🐱',
  '🍕', '🍰', '🧋', '🍫', '🎮', '🎵', '📸', '🏠',
];

export default function ChatScreen() {
  const { session } = useAuth();
  const { profile, partner } = useProfile(session?.user?.id);
  const { messages, sendMessage, markAsSeen } = useMessages(
    session?.user?.id,
    partner?.id
  );
  const { t } = useLanguage();

  const [text, setText] = useState('');
  const [showStickers, setShowStickers] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Mark messages as seen
  useEffect(() => {
    messages
      .filter((m) => m.sender_id === partner?.id && !m.seen)
      .forEach((m) => markAsSeen(m.id));
  }, [messages]);

  const handleSendText = async () => {
    if (!text.trim()) return;
    if (!partner) {
      Alert.alert('No partner', 'Link your partner first');
      return;
    }
    const content = text.trim();
    setText('');
    await sendMessage('text', content, null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSendSticker = async (sticker: string) => {
    if (!partner) return;
    await sendMessage('sticker', sticker, null);
    setShowStickers(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSendPhoto = async () => {
    if (!partner) {
      Alert.alert('No partner', 'Link your partner first');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });

    if (result.canceled) return;

    setSending(true);
    try {
      const uri = result.assets[0].uri;
      const ext = uri.split('.').pop() || 'jpg';
      const fileName = `photos/${session?.user?.id}/${Date.now()}.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('scrible-media')
        .upload(fileName, new Uint8Array(arrayBuffer), {
          contentType: `image/${ext}`,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('scrible-media')
        .getPublicUrl(fileName);

      await sendMessage('photo', null, urlData.publicUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not send photo');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === session?.user?.id;
    const time = new Date(item.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.theirBubble,
        ]}
      >
        {item.type === 'text' && (
          <Text style={[styles.messageText, isMe && styles.myMessageText]}>
            {item.content}
          </Text>
        )}

        {item.type === 'sticker' && (
          <Text style={styles.stickerText}>{item.content}</Text>
        )}

        {(item.type === 'drawing' || item.type === 'photo') && item.media_url && (
          <Image
            source={{ uri: item.media_url }}
            style={styles.mediaImage}
            contentFit="cover"
          />
        )}

        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
            {time}
          </Text>
          {isMe && (
            <Text style={styles.seenIndicator}>
              {item.seen ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {partner?.display_name || t('chat_title')}
        </Text>
        {partner && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
        )}
      </View>

      {/* Messages */}
      {!partner ? (
        <View style={styles.emptyState}>
          <Feather name="users" size={48} color={Colors.textMuted} style={{ marginBottom: Spacing.md }} />
          <Text style={styles.emptyTitle}>{t('no_partner_linked')}</Text>
          <Text style={styles.emptyText}>
            {t('go_to_profile')}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="message-square" size={48} color={Colors.textMuted} style={{ marginBottom: Spacing.md }} />
              <Text style={styles.emptyTitle}>{t('start_talking')}</Text>
              <Text style={styles.emptyText}>
                {t('send_first_message')} {partner.display_name}
              </Text>
            </View>
          }
        />
      )}

      {/* Stickers panel */}
      {showStickers && (
        <View style={styles.stickerPanel}>
          <View style={styles.stickerGrid}>
            {STICKERS.map((sticker, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleSendSticker(sticker)}
                style={styles.stickerItem}
              >
                <Text style={styles.stickerItemText}>{sticker}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input bar */}
      {partner && (
        <View style={styles.inputBar}>
          <TouchableOpacity
            onPress={handleSendPhoto}
            style={styles.inputAction}
          >
            <Feather name="camera" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowStickers(!showStickers)}
            style={styles.inputAction}
          >
            <Feather name="smile" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder={t('type_message')}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            onFocus={() => setShowStickers(false)}
          />

          <TouchableOpacity
            onPress={handleSendText}
            disabled={!text.trim() || sending}
            style={[
              styles.sendButton,
              text.trim() && styles.sendButtonActive,
            ]}
          >
            <Feather name="send" size={18} color={text.trim() ? '#FFF' : Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl + 16,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
  },
  onlineIndicator: {
    marginLeft: Spacing.sm,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.online,
  },
  messageList: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceLight,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  stickerText: {
    fontSize: 48,
    textAlign: 'center',
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: Colors.textMuted,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  seenIndicator: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  stickerPanel: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  stickerItem: {
    width: '12.5%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerItemText: {
    fontSize: 28,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    gap: 6,
  },
  inputAction: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputActionText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  sendButtonText: {
    fontSize: 18,
  },
});
