import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStats } from '../hooks/useStats';
import { getCareerInfo } from '../hooks/useXP';
import { units } from '../data/questions';
import ThemedBackground from '../components/ThemedBackground';

export default function StatsScreen() {
  const { stats, clearStats } = useStats();
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    const loadXP = async () => {
      const data = await AsyncStorage.getItem('psiko_xp');
      if (data) setTotalXP(parseInt(data));
    };
    loadXP();
  }, []);

  const unitStats = units.filter(u => u.id !== 'all').map(unit => ({
    ...unit,
    correct: stats[unit.id]?.correct || 0,
    wrong: stats[unit.id]?.wrong || 0,
    total: (stats[unit.id]?.correct || 0) + (stats[unit.id]?.wrong || 0),
  }));

  const totalCorrect = unitStats.reduce((sum, u) => sum + u.correct, 0);
  const totalWrong = unitStats.reduce((sum, u) => sum + u.wrong, 0);
  const totalQuestions = totalCorrect + totalWrong;
  const weakUnits = unitStats.filter(u => u.total > 0 && Math.round((u.correct / u.total) * 100) < 70);
  const strongUnits = unitStats.filter(u => u.total > 0 && Math.round((u.correct / u.total) * 100) >= 70);

  const getFeedback = () => {
    if (totalQuestions === 0) return null;
    if (weakUnits.length === 0) return '🎉 Tüm konularda güçlü görünüyorsun! Çalışmalarını sürdür.';
    const weakNames = weakUnits.map(u => u.name).join(', ');
    return `Özellikle şu konulara odaklanmanı öneririm: ${weakNames}.`;
  };

  const feedback = getFeedback();
  const careerInfo = getCareerInfo(totalXP);
  const xpProgress = careerInfo.next
    ? ((totalXP - careerInfo.current.minXP) / (careerInfo.next.minXP - careerInfo.current.minXP)) * 100
    : 100;

  const handleClearStats = async () => {
    await clearStats();
    await AsyncStorage.removeItem('psiko_xp');
    setTotalXP(0);
  };

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📊 Başarı Durumum</Text>

        <View style={styles.careerBox}>
          <Text style={styles.careerTitle}>{careerInfo.current.title}</Text>
          <Text style={styles.xpText}>{totalXP} XP {careerInfo.next ? `/ ${careerInfo.next.minXP} XP` : '(MAX)'}</Text>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
          </View>
          {careerInfo.next && <Text style={styles.nextLevel}>Sonraki unvan: {careerInfo.next.title}</Text>}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{totalQuestions}</Text>
            <Text style={styles.summaryLabel}>Toplam</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#5fffaa' }]}>{totalCorrect}</Text>
            <Text style={styles.summaryLabel}>Doğru</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: '#ff8080' }]}>{totalWrong}</Text>
            <Text style={styles.summaryLabel}>Yanlış</Text>
          </View>
        </View>

        {feedback && (
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackTitle}>🗒️ Eğitmen Geri Bildirimi</Text>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {strongUnits.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>💪 Güçlü Olduğun Konular</Text>
            {strongUnits.map((unit) => {
              const percentage = Math.round((unit.correct / unit.total) * 100);
              return (
                <View key={unit.id} style={styles.unitCard}>
                  <View style={styles.unitHeader}>
                    <Text style={styles.unitIcon}>{unit.icon}</Text>
                    <Text style={styles.unitName}>{unit.name}</Text>
                    <Text style={[styles.unitPercent, { color: '#5fffaa' }]}>%{percentage}</Text>
                  </View>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: '#28a745' }]} />
                  </View>
                  <Text style={styles.unitDetail}>{unit.correct} doğru / {unit.wrong} yanlış</Text>
                </View>
              );
            })}
          </>
        )}

        {weakUnits.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📚 Gelişim Gerektiren Konular</Text>
            {weakUnits.map((unit) => {
              const percentage = Math.round((unit.correct / unit.total) * 100);
              return (
                <View key={unit.id} style={[styles.unitCard, styles.weakCard]}>
                  <View style={styles.unitHeader}>
                    <Text style={styles.unitIcon}>{unit.icon}</Text>
                    <Text style={styles.unitName}>{unit.name}</Text>
                    <Text style={[styles.unitPercent, { color: percentage >= 40 ? '#fdcb6e' : '#ff8080' }]}>%{percentage}</Text>
                  </View>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: percentage >= 40 ? '#fdcb6e' : '#dc3545' }]} />
                  </View>
                  <Text style={styles.unitDetail}>{unit.correct} doğru / {unit.wrong} yanlış</Text>
                </View>
              );
            })}
          </>
        )}

        {unitStats.filter(u => u.total === 0).length > 0 && (
          <>
            <Text style={styles.sectionTitle}>⏳ Henüz Çözülmemiş Konular</Text>
            {unitStats.filter(u => u.total === 0).map((unit) => (
              <View key={unit.id} style={styles.unitCard}>
                <View style={styles.unitHeader}>
                  <Text style={styles.unitIcon}>{unit.icon}</Text>
                  <Text style={styles.unitName}>{unit.name}</Text>
                  <Text style={styles.unitPercent}>-</Text>
                </View>
                <Text style={styles.noData}>Henüz soru çözülmedi</Text>
              </View>
            ))}
          </>
        )}

        {totalQuestions > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearStats}>
            <Text style={styles.clearButtonText}>🗑️ İstatistikleri Sıfırla</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 10 },
  careerBox: { backgroundColor: 'rgba(168,85,247,0.2)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)' },
  careerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  xpText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  xpBarBg: { height: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  xpBarFill: { height: 10, backgroundColor: '#a855f7', borderRadius: 5 },
  nextLevel: { fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  summaryBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  summaryItem: { alignItems: 'center' },
  summaryNumber: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  summaryLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  feedbackBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  feedbackTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  feedbackText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 10, marginTop: 4 },
  unitCard: { backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  weakCard: { borderLeftWidth: 4, borderLeftColor: '#dc3545' },
  unitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  unitIcon: { fontSize: 20, marginRight: 8 },
  unitName: { fontSize: 14, fontWeight: '600', color: '#fff', flex: 1 },
  unitPercent: { fontSize: 16, fontWeight: 'bold' },
  barBackground: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, marginBottom: 6, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  unitDetail: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  noData: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' },
  clearButton: { marginTop: 16, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#dc3545', alignItems: 'center', marginBottom: 20 },
  clearButtonText: { color: '#ff8080', fontSize: 15, fontWeight: '600' },
});