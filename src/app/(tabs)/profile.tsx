import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useProfile } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { profile, partner, refetch } = useProfile(session?.user?.id);
  const { t, language, setLanguage } = useLanguage();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [linking, setLinking] = useState(false);

  const handleLinkPartner = async () => {
    if (!partnerEmail.trim()) {
      Alert.alert('Error', "Please enter your partner's email");
      return;
    }

    setLinking(true);
    try {
      // Find partner by email in profiles (they need to be registered)
      const { data: partnerProfile, error } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', (
          await supabase.rpc('get_user_id_by_email', { email_input: partnerEmail.trim() })
        ).data)
        .single();

      if (error || !partnerProfile) {
        // Fallback: try to find directly if RPC doesn't exist
        // For hardcoded approach, we'll update partner_id directly
        Alert.alert(
          'Manual link',
          'Ask your partner for their user ID from their profile. Then link it here.',
        );
        setLinking(false);
        return;
      }

      // Link both profiles
      await supabase
        .from('profiles')
        .update({ partner_id: partnerProfile.id })
        .eq('id', session?.user?.id);

      await supabase
        .from('profiles')
        .update({ partner_id: session?.user?.id })
        .eq('id', partnerProfile.id);

      Alert.alert('Linked', `You are now connected with ${partnerProfile.display_name}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not link');
    } finally {
      setLinking(false);
    }
  };



  const handleDirectLink = async (partnerId: string) => {
    if (!partnerId.trim()) return;

    setLinking(true);
    try {
      // Link both profiles
      const { error: error1 } = await supabase
        .from('profiles')
        .update({ partner_id: partnerId.trim() })
        .eq('id', session?.user?.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('profiles')
        .update({ partner_id: session?.user?.id })
        .eq('id', partnerId.trim());

      if (error2) throw error2;

      Alert.alert('Linked', 'You are now connected');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not link');
    } finally {
      setLinking(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('sign_out'), 'Are you sure?', [
      { text: t('no'), style: 'cancel' },
      {
        text: t('yes'),
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile_title')}</Text>
      </View>

      {/* Language Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === 'es' && styles.languageButtonActive]}
            onPress={() => setLanguage('es')}
          >
            <Text style={[styles.languageText, language === 'es' && styles.languageTextActive]}>Español</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.languageButton, language === 'fi' && styles.languageButtonActive]}
            onPress={() => setLanguage('fi')}
          >
            <Text style={[styles.languageText, language === 'fi' && styles.languageTextActive]}>Suomi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarEmoji}>
              {profile?.display_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </LinearGradient>
        </View>
        <Text style={styles.displayName}>
          {profile?.display_name || 'No name'}
        </Text>
        <Text style={styles.email}>{session?.user?.email}</Text>
      </View>

      {/* Partner Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('your_partner')}</Text>
        {partner ? (
          <View style={styles.partnerCard}>
            <LinearGradient
              colors={[Colors.secondary, Colors.primary]}
              style={styles.partnerAvatar}
            >
              <Text style={styles.partnerAvatarText}>
                {partner.display_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{partner.display_name}</Text>
              <Text style={styles.partnerStatus}>{t('linked')}</Text>
            </View>
            <View style={[styles.onlineDot, { backgroundColor: Colors.online }]} />
          </View>
        ) : (
          <View style={styles.linkSection}>
            <Text style={styles.linkDescription}>
              {t('enter_partner_id')}
            </Text>
            <TextInput
              style={styles.linkInput}
              value={partnerEmail}
              onChangeText={setPartnerEmail}
              placeholder={t('partner_id_placeholder')}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => handleDirectLink(partnerEmail)}
              disabled={linking}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.linkButton}
              >
                <Text style={styles.linkButtonText}>
                  {linking ? t('linking') : t('link')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* User ID (for sharing) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('your_user_id')}</Text>
        <TouchableOpacity
          style={styles.idCard}
          onPress={() => {
            // Copy to clipboard would go here
            Alert.alert(t('id_copied'), session?.user?.id || '');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Text style={styles.idText} numberOfLines={1}>
            {session?.user?.id}
          </Text>
          <Text style={styles.idHint}>{t('tap_to_copy')}</Text>
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        <Text style={styles.signOutText}>{t('sign_out')}</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Scrible v1.0.0</Text>
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
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.xl,
    ...Shadows.medium,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  displayName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  email: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  partnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerAvatarText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  partnerName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  partnerStatus: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.xs,
    color: Colors.primary,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  linkSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  linkDescription: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  linkInput: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.md,
  },
  linkButton: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  linkButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.md,
    color: '#FFFFFF',
  },
  idCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  idText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  idHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: Colors.textMuted,
  },
  signOutButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 106, 0.3)',
    marginBottom: Spacing.lg,
  },
  signOutText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.md,
    color: Colors.error,
  },
  version: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  languageButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  languageButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  languageText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  languageTextActive: {
    color: Colors.primary,
    fontFamily: 'Poppins_700Bold',
  },
});
