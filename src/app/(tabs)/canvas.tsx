import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Canvas, Path, Skia, useCanvasRef } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useProfile, useMessages } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing, BorderRadius, FontSizes, Shadows } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - Spacing.lg * 2;
const STROKE_WIDTHS = [3, 6, 10, 16];

interface StrokePath {
  path: any;
  color: string;
  strokeWidth: number;
}

export default function CanvasScreen() {
  const { session } = useAuth();
  const { partner } = useProfile(session?.user?.id);
  const { sendMessage } = useMessages(session?.user?.id, partner?.id);

  const [paths, setPaths] = useState<StrokePath[]>([]);
  const [currentColor, setCurrentColor] = useState<string>(Colors.primary);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(STROKE_WIDTHS[1]);
  const [isEraser, setIsEraser] = useState(false);
  const [sending, setSending] = useState(false);

  const canvasRef = useCanvasRef();
  const currentPath = useRef<any>(null);

  const pan = Gesture.Pan()
    .onStart((e) => {
      const path = Skia.Path.Make();
      path.moveTo(e.x, e.y);
      currentPath.current = {
        path,
        color: isEraser ? Colors.background : currentColor,
        strokeWidth: isEraser ? 30 : currentStrokeWidth,
      };
      setPaths((prev) => [...prev, currentPath.current]);
    })
    .onUpdate((e) => {
      if (currentPath.current) {
        currentPath.current.path.lineTo(e.x, e.y);
        // Force re-render
        setPaths((prev) => [...prev]);
      }
    })
    .onEnd(() => {
      currentPath.current = null;
    })
    .minDistance(1);

  const handleUndo = () => {
    setPaths((prev) => prev.slice(0, -1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClear = () => {
    Alert.alert('¿Borrar todo?', '¿Seguro que quieres limpiar el lienzo?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        style: 'destructive',
        onPress: () => {
          setPaths([]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const handleSend = async () => {
    if (paths.length === 0) {
      Alert.alert('¡Dibuja algo!', 'El lienzo está vacío 🎨');
      return;
    }
    if (!partner) {
      Alert.alert('Sin pareja', 'Vincula tu pareja primero en el perfil');
      return;
    }

    setSending(true);
    try {
      // Capture canvas as image
      const image = canvasRef.current?.makeImageSnapshot();
      if (!image) throw new Error('No se pudo capturar el dibujo');

      const bytes = image.encodeToBase64();
      const fileName = `drawings/${session?.user?.id}/${Date.now()}.png`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('scrible-media')
        .upload(fileName, decode(bytes), {
          contentType: 'image/png',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('scrible-media')
        .getPublicUrl(fileName);

      // Send as message
      await sendMessage('drawing', null, urlData.publicUrl);

      Alert.alert('¡Enviado! 🎉', `${partner.display_name} recibirá tu dibujo`);
      setPaths([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar');
    } finally {
      setSending(false);
    }
  };

  const selectColor = (color: string) => {
    setCurrentColor(color);
    setIsEraser(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✏️ Dibujar</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleUndo} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>↩️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <GestureDetector gesture={pan}>
          <Canvas ref={canvasRef} style={styles.canvas}>
            {paths.map((stroke, index) => (
              <Path
                key={index}
                path={stroke.path}
                color={stroke.color}
                style="stroke"
                strokeWidth={stroke.strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
          </Canvas>
        </GestureDetector>
      </View>

      {/* Tools */}
      <View style={styles.tools}>
        {/* Color picker */}
        <View style={styles.colorPicker}>
          {Colors.canvasColors.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => selectColor(color)}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                currentColor === color && !isEraser && styles.colorDotSelected,
              ]}
            />
          ))}
        </View>

        {/* Stroke width */}
        <View style={styles.strokePicker}>
          {STROKE_WIDTHS.map((sw) => (
            <TouchableOpacity
              key={sw}
              onPress={() => {
                setCurrentStrokeWidth(sw);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.strokeOption,
                currentStrokeWidth === sw && styles.strokeOptionSelected,
              ]}
            >
              <View
                style={[
                  styles.strokeDot,
                  {
                    width: sw + 4,
                    height: sw + 4,
                    backgroundColor: currentStrokeWidth === sw ? Colors.primary : Colors.textMuted,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => {
              setIsEraser(!isEraser);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.strokeOption,
              isEraser && styles.eraserSelected,
            ]}
          >
            <Text style={styles.eraserEmoji}>🧹</Text>
          </TouchableOpacity>
        </View>

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendButton}
          >
            {sending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.sendButtonText}>
                Enviar a {partner?.display_name || 'pareja'} 💕
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Base64 decode helper
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl + 16,
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  headerButtonText: {
    fontSize: 18,
  },
  canvasContainer: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.medium,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: Colors.background,
  },
  tools: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
  strokePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  strokeOption: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  strokeOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
  },
  strokeDot: {
    borderRadius: 999,
  },
  eraserSelected: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
  },
  eraserEmoji: {
    fontSize: 16,
  },
  sendButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  sendButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: FontSizes.md,
    color: '#FFFFFF',
  },
});
