import { View, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';

// edgeToEdgeEnabled (Android) uygulamanın içeriğini sistem çubuklarının ARKASINA
// çiziyor. Bu yüzden alt kısımdaki butonlar bazı cihazlarda gezinme çubuğu
// (geri/ana ekran/son uygulamalar) veya iPhone home indicator'ı tarafından
// örtülüyordu. Alt boşluğu (inset) burada tek yerden ekleyerek tüm ekranları
// tek seferde düzeltiyoruz.
export default function ThemedBackground({ children, style }) {
  const { currentTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const safeBottomStyle = { paddingBottom: insets.bottom };

  if (currentTheme.type === 'image') {
    return (
      <ImageBackground source={currentTheme.source} style={[styles.bg, style]} resizeMode="cover">
        <View style={[styles.overlay, safeBottomStyle]}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  return (
    <LinearGradient colors={currentTheme.colors} style={[styles.bg, style, safeBottomStyle]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
});