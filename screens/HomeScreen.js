import { FEATURES } from '../config/features';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../components/Avatar';
import { getCareerInfo } from '../hooks/useXP';
import { useDailyGoal } from '../hooks/useDailyGoal';
import { useCoins } from '../hooks/useCoins';
import ThemedBackground from '../components/ThemedBackground';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const [avatarOptions, setAvatarOptions] = useState(null);
  const [xp, setXP] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const { todayCount, completed, DAILY_GOAL, loadDaily } = useDailyGoal();
  const { coins, loadCoins } = useCoins();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const avatarData = await AsyncStorage.getItem('psiko_avatar');
      if (avatarData) setAvatarOptions(JSON.parse(avatarData));
      const xpData = await AsyncStorage.getItem('psiko_xp');
      if (xpData) setXP(parseInt(xpData));
      loadDaily();
      loadCoins();
    } catch (e) {}
  };

  const { current, next } = getCareerInfo(xp);
  const xpProgress = next ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100 : 100;
  const dailyProgress = Math.min((todayCount / DAILY_GOAL) * 100, 100);

  return (
    <ThemedBackground>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.title}>🧠 Filandy</Text>

        <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Avatar')}>
          <Avatar options={avatarOptions} size={100} />
          <View style={styles.careerInfo}>
            <Text style={styles.careerTitle}>{current.title}</Text>
            <Text style={styles.coinText}>🪙 {coins} coin</Text>
            <Text style={styles.xpText}>{xp} XP {next ? `/ ${next.minXP} XP` : '(MAX)'}</Text>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
            </View>
            {next && <Text style={styles.nextLevel}>Sonraki: {next.title}</Text>}
          </View>
        </TouchableOpacity>

        <View style={styles.coinHintBox}>
          <Text style={styles.coinHint}>🪙 Coin biriktir! Yakında özel içerikler, temalar ve daha fazlası için kullanabileceksin.</Text>
        </View>

        <View style={[styles.dailyCard, completed && styles.dailyCardCompleted]}>
          <View style={styles.dailyHeader}>
            <Text style={styles.dailyTitle}>📅 Günlük Görev</Text>
            {completed
              ? <Text style={styles.dailyBadge}>✅ Tamamlandı!</Text>
              : <Text style={styles.dailyBadge}>+100 XP</Text>
            }
          </View>
          <Text style={styles.dailyDesc}>
            {completed
              ? 'Bugünkü görevini tamamladın, harika!'
              : `Bugün ${DAILY_GOAL} soru çöz — ${Math.max(DAILY_GOAL - todayCount, 0)} soru kaldı`
            }
          </Text>
          <View style={styles.dailyBarBg}>
            <View style={[styles.dailyBarFill, { width: `${dailyProgress}%` }]} />
          </View>
          <Text style={styles.dailyCount}>{Math.min(todayCount, DAILY_GOAL)} / {DAILY_GOAL}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UnitSelect')}>
          <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>🎮 Oyuna Başla</Text>
          </LinearGradient>
        </TouchableOpacity>

        {FEATURES.challenge && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Challenge')}>
          <LinearGradient colors={['#e17055', '#d63031']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>🔥 Meydan Okuma</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
      </Animated.View>
    </ThemedBackground>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 16, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  avatarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24, padding: 16, marginBottom: 16, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', gap: 16 },
  careerInfo: { flex: 1 },
  careerTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  coinText: { fontSize: 13, color: '#fdcb6e', fontWeight: '600', marginBottom: 4 },
  coinHintBox: { backgroundColor: 'rgba(253,203,110,0.1)', borderRadius: 12, padding: 10, marginBottom: 16, width: '100%', borderWidth: 1, borderColor: 'rgba(253,203,110,0.3)' },
  coinHint: { fontSize: 12, color: 'rgba(253,203,110,0.9)', textAlign: 'center' },  xpText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  xpBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  xpBarFill: { height: 8, backgroundColor: '#a855f7', borderRadius: 4 },
  nextLevel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  dailyCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 16, marginBottom: 16, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  dailyCardCompleted: { borderColor: '#00b894', backgroundColor: 'rgba(0,184,148,0.15)' },
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dailyTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  dailyBadge: { fontSize: 13, color: '#fdcb6e', fontWeight: '600' },
  dailyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  dailyBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  dailyBarFill: { height: 8, backgroundColor: '#00b894', borderRadius: 4 },
  dailyCount: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  button: { width: '100%', marginBottom: 14, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});