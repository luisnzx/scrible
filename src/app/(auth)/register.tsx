import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useSupabase';
import { Colors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useState(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  });

  const handleRegister = async () => {
    if (!displayName || !email || !password) {
      Alert.alert('Oops', 'Rellena todos los campos 💕');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Oops', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      Alert.alert(
        '¡Bienvenid@! 🎉',
        'Revisa tu email para confirmar tu cuenta',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>💌</Text>
          <Text style={styles.title}>Únete</Text>
          <Text style={styles.subtitle}>Crea tu cuenta para empezar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tu nombre</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="¿Cómo te llamas?"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.secondary, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creando...' : 'Crear cuenta 🎉'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={styles.loginTextBold}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: FontSizes.hero,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.md,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  inputLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  button: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  loginTextBold: {
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
  },
});
