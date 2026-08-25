import { View, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

export default function ThemedBackground({ children, style }) {
  const { currentTheme } = useTheme();

  if (currentTheme.type === 'image') {
    return (
      <ImageBackground source={currentTheme.source} style={[styles.bg, style]} resizeMode="cover">
        <View style={styles.overlay}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  return (
    <LinearGradient colors={currentTheme.colors} style={[styles.bg, style]}>
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