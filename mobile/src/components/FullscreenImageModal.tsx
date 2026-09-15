import { X } from 'lucide-react-native';
import { Image, type ImageSource } from 'expo-image';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/constants/theme';
import { type } from '@/constants/typography';
import { useLocale } from '@/src/i18n/LocaleContext';

type FullscreenImageModalProps = {
  visible: boolean;
  source: ImageSource | null;
  label?: string;
  onClose: () => void;
};

/**
 * Lightbox plein écran — image contain, fermeture via ✕ ou fond.
 * Inputs: source expo-image, libellé accessibilité.
 * Outputs: Modal React Native.
 */
export function FullscreenImageModal({
  visible,
  source,
  label,
  onClose,
}: FullscreenImageModalProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { t } = useLocale();

  return (
    <Modal
      visible={visible && source != null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={[styles.closeBtn, { top: insets.top + 8 }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          hitSlop={12}
        >
          <X size={22} color={theme.foreground} strokeWidth={2.5} />
        </Pressable>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { minWidth: width, minHeight: height - insets.top - insets.bottom },
          ]}
          maximumZoomScale={4}
          minimumZoomScale={1}
          centerContent
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bouncesZoom
        >
          {source ? (
            <Image
              source={source}
              style={{ width: width - 24, height: height * 0.82 }}
              contentFit="contain"
              accessibilityLabel={label ?? t('common.closeImage')}
            />
          ) : null}
        </ScrollView>

        <Pressable
          onPress={onClose}
          style={[styles.hintWrap, { bottom: insets.bottom + 16 }]}
          accessibilityRole="button"
          accessibilityLabel={t('common.closeImage')}
        >
          <Text style={styles.hint}>{t('common.tapToClose')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 22, 0.96)',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  hintWrap: {
    position: 'absolute',
    alignSelf: 'center',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    ...type.caption,
    color: theme.muted,
  },
});
