import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useAuth, useProfile, useMessages } from '@/hooks/useSupabase';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { session } = useAuth();
  const { profile, partner } = useProfile(session?.user?.id);
  const { messages } = useMessages(session?.user?.id, partner?.id);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get last drawing/message from partner
  const lastDrawing = messages
    .filter((m) => m.sender_id === partner?.id && m.type === 'drawing')
    .pop();
  const lastMessage = messages
    .filter((m) => m.sender_id === partner?.id)
    .pop();
  const unseenCount = messages.filter(
    (m) => m.sender_id === partner?.id && !m.seen
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hola, {profile?.display_name || 'cariño'} 💕
            </Text>
            <Text style={styles.subGreeting}>
              {partner
                ? `Conectad@ con ${partner.display_name}`
                : 'Vincula tu pareja en el perfil'}
            </Text>
          </View>
          {partner && (
            <View style={styles.onlineContainer}>
              <View style={[styles.onlineDot, { backgroundColor: Colors.online }]} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>

        {/* Last Drawing Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/canvas')}
        >
          <LinearGradient
            colors={[Colors.surfaceLight, Colors.surface]}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>✏️ Último dibujo</Text>
              {lastDrawing && (
                <Text style={styles.cardTime}>
                  {new Date(lastDrawing.created_at).toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>
            {lastDrawing?.media_url ? (
              <Image
                source={{ uri: lastDrawing.media_url }}
                style={styles.drawingPreview}
                contentFit="contain"
              />
            ) : (
              <View style={styles.emptyDrawing}>
                <Text style={styles.emptyEmoji}>🎨</Text>
                <Text style={styles.emptyText}>
                  {partner
                    ? `¡Envía un dibujo a ${partner.display_name}!`
                    : '¡Haz tu primer dibujo!'}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/canvas')}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.quickActionGradient}
            >
              <Text style={styles.quickActionEmoji}>✏️</Text>
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Dibujar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <LinearGradient
              colors={[Colors.secondary, Colors.secondaryDark]}
              style={styles.quickActionGradient}
            >
              <Text style={styles.quickActionEmoji}>💬</Text>
              {unseenCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unseenCount}</Text>
                </View>
              )}
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <LinearGradient
              colors={[Colors.accent, Colors.accentDark]}
              style={styles.quickActionGradient}
            >
              <Text style={styles.quickActionEmoji}>😍</Text>
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Stickers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <LinearGradient
              colors={['#60A5FA', '#3B82F6']}
              style={styles.quickActionGradient}
            >
              <Text style={styles.quickActionEmoji}>📸</Text>
            </LinearGradient>
            <Text style={styles.quickActionLabel}>Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Last Message Card */}
        {lastMessage && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <View style={styles.messageCard}>
              <View style={styles.messageCardHeader}>
                <Text style={styles.cardTitle}>
                  💌 De {partner?.display_name || 'tu pareja'}
                </Text>
                <Text style={styles.cardTime}>
                  {new Date(lastMessage.created_at).toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.messagePreview} numberOfLines={2}>
                {lastMessage.type === 'text'
                  ? lastMessage.content
                  : lastMessage.type === 'drawing'
                  ? '🎨 Te envió un dibujo'
                  : lastMessage.type === 'photo'
                  ? '📸 Te envió una foto'
                  : '😍 Te envió un sticker'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl + 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontFamily: 'Poppins_700Bold',
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  subGreeting: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: FontSizes.xs,
    color: Colors.online,
  },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  cardTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
  },
  drawingPreview: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceElevated,
  },
  emptyDrawing: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  quickActionEmoji: {
    fontSize: 26,
  },
  quickActionLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  messageCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.small,
  },
  messageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  messagePreview: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});
