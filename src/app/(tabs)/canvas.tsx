import { ActivityIndicator, View, Text } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useLanguage } from '@/context/LanguageContext';
import { Colors, Spacing } from '@/constants/theme';

export default function CanvasScreen() {
  const { t } = useLanguage();

  return (
    <WithSkiaWeb
      opts={{ locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.41.0/bin/full/${file}` }}
      getComponent={() => import('@/components/DrawingCanvas')}
      fallback={
        <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ color: Colors.textSecondary, marginTop: Spacing.md }}>
            {t('loading_canvas')}
          </Text>
        </View>
      }
    />
  );
}
