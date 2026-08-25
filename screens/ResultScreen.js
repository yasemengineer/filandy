import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCareerInfo } from '../hooks/useXP';
import { useDailyGoal } from '../hooks/useDailyGoal';
import ThemedBackground from '../components/ThemedBackground';

export default function ResultScreen({ navigation, route }) {
  const { score, total, unitName, unitId, wrongAnswers, levelResult } = route.params;
  const percentage = Math.round((score / total) * 100);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [totalXP, setTotalXP] = useState(0);
  const [dailyBonus, setDailyBonus] = useState(0);
  const [aiFeedback, setAiFeedback] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const { addDailyProgress } = useDailyGoal();

  useEffect(() => {
    const init = async () => {
      const xpData = await AsyncStorage.getItem('psiko_xp');
      let currentXP = xpData ? parseInt(xpData) : 0;

      const bonus = await addDailyProgress(score);
      if (bonus > 0) {
        currentXP += bonus;
        await AsyncStorage.setItem('psiko_xp', currentXP.toString());
        setDailyBonus(bonus);
      }

      setTotalXP(currentXP);

      if (levelResult?.leveledUp) {
        setTimeout(() => setShowLevelModal(true), 800);
      }

      if (wrongAnswers && wrongAnswers.length > 0) {
        getAIFeedback(wrongAnswers);
      }
    };

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    init();
  }, []);

  const getAIFeedback = async (wrong) => {
    setAiLoading(true);
    try {
      const wrongList = wrong.map(w => `- ${w.question}`).join('\n');
      const prompt = `Sen bir psikoloji eğitmenisin. Psikoloji öğrencisi şu soruları yanlış cevapladı:\n\n${wrongList}\n\nKonu: ${unitName}\n\nBu öğrenciye kısa, yapıcı ve motive edici bir geri bildirim ver. Hangi konulara odaklanması gerektiğini söyle. Türkçe yaz, 3-4 cümle olsun.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(i => i.text || '').join('');
      if (text) setAiFeedback(text);
    } catch (e) {
      setAiFeedback('');
    }
    setAiLoading(false);
  };

  const getTitle = () => {
    if (percentage === 100) return '🏆 Olağanüstü!';
    if (percentage >= 70) return '⭐ Harika Gidiyor!';
    if (percentage >= 40) return '📚 Gelişiyorsun!';
    return '🌱 Büyük Yolculuklar Küçük Adımlarla Başlar!';
  };

  const careerInfo = getCareerInfo(totalXP);

  return (
    <>
      <ThemedBackground>
        <ScrollView contentContainerStyle={styles.container}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>{getTitle()}</Text>
          </Animated.View>

          <Animated.View style={[styles.scoreBox, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.scoreText}>{score} / {total}</Text>
            <Text style={styles.percentText}>%{percentage} Doğru</Text>
            <Text style={styles.unitText}>{unitName}</Text>
          </Animated.View>

          <View style={styles.xpBox}>
            <Text style={styles.xpBoxTitle}>⚡ Toplam XP</Text>
            <Text style={styles.xpBoxValue}>{totalXP} XP</Text>
            <Text style={styles.xpBoxCareer}>{careerInfo.current.title}</Text>
          </View>

          {dailyBonus > 0 && (
            <View style={styles.dailyBonusBox}>
              <Text style={styles.dailyBonusText}>📅 Günlük Görev Tamamlandı! +{dailyBonus} XP Bonus!</Text>
            </View>
          )}

          {percentage >= 70 ? (
            <View style={styles.passBox}>
              <Text style={styles.passText}>✅ Bu seviyeyi geçtin!</Text>
            </View>
          ) : (
            <View style={styles.failBox}>
              <Text style={styles.failText}>❌ Seviye geçmek için %70 gerekiyor. Tekrar dene!</Text>
            </View>
          )}

          <View style={styles.feedbackBox}>
            {wrongAnswers?.length === 0 ? (
              <Text style={styles.feedbackText}>🎉 Mükemmel! Tüm soruları doğru yanıtladın. Böyle devam et!</Text>
            ) : percentage >= 70 ? (
              <Text style={styles.feedbackText}>💪 Harika iş çıkardın! Aynı konuyu tekrar çalışarak eksiklerini tamamlayabilirsin. Her tekrar seni daha iyi bir psikolog yapacak!</Text>            
            ) : percentage >= 40 ? (
              <Text style={styles.feedbackText}>📚 İyi bir başlangıç! Psikoloji geniş bir alan, her gün biraz çalışmak seni hedefe taşır. Vazgeçme!</Text>
            ) : (
              <Text style={styles.feedbackText}>🌱 Her uzman bir zamanlar başlangıç noktasındaydı. Tekrar dene, her seferinde daha iyi olacaksın!</Text>
            )}
          </View>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UnitSelect')}>
            <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🎮 Yeni Tur</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
            <LinearGradient colors={['#0984e3', '#00b894']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>🏠 Ana Menü</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </ThemedBackground>

      <Modal visible={showLevelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Seviye Atladın!</Text>
            <Text style={styles.modalUnvan}>{levelResult?.unvan}</Text>
            <Text style={styles.modalSub}>Tebrikler! {unitName} konusunda yeni unvanını kazandın.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowLevelModal(false)}>
              <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Harika! 🚀</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flexGrow: 1, alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 24, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  scoreBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 16, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  scoreText: { fontSize: 52, fontWeight: 'bold', color: '#fff' },
  percentText: { fontSize: 20, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  unitText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  xpBox: { backgroundColor: 'rgba(168,85,247,0.2)', borderRadius: 16, padding: 16, marginBottom: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)' },
  xpBoxTitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  xpBoxValue: { fontSize: 28, fontWeight: 'bold', color: '#a855f7' },
  xpBoxCareer: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '600' },
  dailyBonusBox: { backgroundColor: 'rgba(0,184,148,0.25)', borderRadius: 12, padding: 14, marginBottom: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#00b894' },
  dailyBonusText: { color: '#00b894', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  passBox: { backgroundColor: 'rgba(40,167,69,0.25)', borderRadius: 12, padding: 14, marginBottom: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#28a745' },
  passText: { color: '#5fffaa', fontSize: 15, fontWeight: '600' },
  failBox: { backgroundColor: 'rgba(220,53,69,0.25)', borderRadius: 12, padding: 14, marginBottom: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#dc3545' },
  failText: { color: '#ff8080', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  feedbackBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 18, marginBottom: 24, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  feedbackTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  feedbackText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  button: { width: '100%', marginBottom: 14, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#1e1e5e', borderRadius: 24, padding: 32, alignItems: 'center', width: '80%', borderWidth: 1, borderColor: 'rgba(168,85,247,0.5)' },
  modalEmoji: { fontSize: 60, marginBottom: 12 },
  modalTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  modalUnvan: { fontSize: 20, color: '#a855f7', fontWeight: '600', marginBottom: 12 },
  modalSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalButton: { width: '100%', borderRadius: 16, overflow: 'hidden' },
});