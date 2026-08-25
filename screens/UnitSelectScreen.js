import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mainCategories } from '../data/questions/index.js';
import ThemedBackground from '../components/ThemedBackground';

export default function UnitSelectScreen({ navigation }) {
  const [levels, setLevels] = useState({});
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadLevels);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    return unsubscribe;
  }, [navigation]);

  const loadLevels = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_levels');
      if (data) setLevels(JSON.parse(data));
    } catch (e) {}
  };

  const getLevelStars = (catId) => {
    const level = levels[catId]?.level || 1;
    const color = level === 5 ? '#00b894' : level >= 3 ? '#fdcb6e' : 'rgba(255,255,255,0.4)';
    const stars = '⭐'.repeat(level) + '☆'.repeat(5 - level);
    return { stars, color, level };
  };

  return (
    <ThemedBackground>
      <Animated.ScrollView contentContainerStyle={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Konu Seç</Text>
        <Text style={styles.subtitle}>Hangi alanda çalışmak istiyorsun?</Text>

        <TouchableOpacity
          style={styles.allCard}
          onPress={() => navigation.navigate('Game', { unitId: 'all', unitName: 'Karışık' })}
        >
          <Text style={styles.allIcon}>🎲</Text>
          <Text style={styles.allText}>Tüm Konulardan Karışık</Text>
        </TouchableOpacity>

        {mainCategories.map((cat) => {
          const { stars, color, level } = getLevelStars(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              style={styles.mainCard}
              onPress={() => navigation.navigate('Game', {
                unitId: cat.id,
                unitName: cat.name,
              })}
              activeOpacity={0.85}
            >
              <View style={[styles.colorBar, { backgroundColor: cat.color }]} />
              <Text style={styles.mainIcon}>{cat.icon}</Text>
              <View style={styles.mainCardContent}>
                <Text style={styles.mainName}>{cat.name}</Text>
                <View style={styles.levelRow}>
                  <Text style={[styles.stars, { color }]}>{stars}</Text>
                  <Text style={[styles.levelText, { color }]}>Seviye {level}</Text>
                </View>
              </View>
              {level === 3 && <Text style={styles.completedBadge}>✅</Text>}
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 6, marginTop: 10 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },
  allCard: { backgroundColor: 'rgba(108,92,231,0.3)', borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(108,92,231,0.5)' },
  allIcon: { fontSize: 28, marginRight: 12 },
  allText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  mainCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', paddingVertical: 14, paddingRight: 14 },
  colorBar: { width: 5, alignSelf: 'stretch' },
  mainIcon: { fontSize: 24, marginHorizontal: 12 },
  mainCardContent: { flex: 1 },
  mainName: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { fontSize: 12 },
  levelText: { fontSize: 12, fontWeight: '500' },
  completedBadge: { fontSize: 18, marginLeft: 8 },
});