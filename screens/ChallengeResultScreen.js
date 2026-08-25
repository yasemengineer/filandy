import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';

export default function ChallengeResultScreen({ navigation, route }) {
  const { score, total, xp, timeLeft } = route.params;
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const getTitle = () => {
    if (xp >= 500) return '🏆 Efsane!';
    if (xp >= 300) return '⭐ Harika!';
    if (xp >= 100) return '💪 İyi İş!';
    if (xp >= 0) return '📚 Fena Değil!';
    return '😅 Tekrar Dene!';
  };

  return (
    <ThemedBackground>
      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>{getTitle()}</Text>
        </Animated.View>

        <Animated.View style={[styles.scoreBox, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.scoreLabel}>Doğru Cevap</Text>
          <Text style={styles.scoreText}>{score} / {total}</Text>
          <View style={styles.divider} />
          <Text style={styles.xpLabel}>Kazanılan XP</Text>
          <Text style={[styles.xpText, { color: xp >= 0 ? '#5fffaa' : '#ff8080' }]}>
            {xp >= 0 ? '+' : ''}{xp} XP
          </Text>
          <View style={styles.divider} />
          <Text style={styles.timeLabel}>Kalan Süre</Text>
          <Text style={styles.timeText}>{timeLeft}s</Text>
        </Animated.View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Challenge')}>
          <LinearGradient colors={['#e17055', '#d63031']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>🔥 Tekrar Meydan Oku</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
          <LinearGradient colors={['#0984e3', '#00b894']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>🏠 Ana Menü</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 24, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  scoreBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 32, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  scoreLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  scoreText: { fontSize: 42, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  divider: { width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  xpLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  xpText: { fontSize: 36, fontWeight: 'bold', marginBottom: 16 },
  timeLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  timeText: { fontSize: 28, fontWeight: 'bold', color: '#fdcb6e' },
  button: { width: '100%', marginBottom: 14, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});