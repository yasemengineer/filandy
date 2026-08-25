import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { questions } from '../data/questions';
import OptionButton from '../components/OptionButton';
import { useXP } from '../hooks/useXP';
import ThemedBackground from '../components/ThemedBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOTAL_TIME = 60;

export default function ChallengeScreen({ navigation }) {
  const { addXP } = useXP();
  const [shuffledQuestions] = useState(() => [...questions].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [xp, setXP] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [xpChange, setXpChange] = useState(null);
  const [xpAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const timerRef = useRef(null);
  const countdownSoundRef = useRef(null);
  const countdownStarted = useRef(false);

  const current = shuffledQuestions[currentIndex];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopCountdown();
          setGameOver(true);
          return 0;
        }
        if (prev <= 10 && !countdownStarted.current) {
          countdownStarted.current = true;
          playCountdown();
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      stopCountdown();
    };
  }, []);

  const playCountdown = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/countdown.wav'),
        { shouldPlay: true, isLooping: true }
      );
      countdownSoundRef.current = sound;
    } catch (e) {}
  };

  const stopCountdown = async () => {
    try {
      if (countdownSoundRef.current) {
        await countdownSoundRef.current.stopAsync();
        await countdownSoundRef.current.unloadAsync();
        countdownSoundRef.current = null;
      }
    } catch (e) {}
  };

  const playCorrect = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/correct.wav'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(s => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch (e) {}
  };

  const playWrong = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(require('../assets/sounds/wrong.wav'));
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(s => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch (e) {}
  };

  const showXPAnim = (amount, isPositive) => {
    setXpChange({ amount, isPositive });
    xpAnim.setValue(0);
    Animated.sequence([
      Animated.spring(xpAnim, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(xpAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setXpChange(null));
  };

  const animateNext = (callback) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(callback);
  };

  const handleAnswer = async (index) => {
    if (selectedAnswer !== null || gameOver) return;
    setSelectedAnswer(index);

    const isCorrect = index === current.correctAnswer;
    let xpDelta = 0;

    if (isCorrect) {
      xpDelta = 100;
      setScore(prev => prev + 1);
      await playCorrect();
    } else {
      xpDelta = -50;
      await playWrong();
    }

    setXP(prev => prev + xpDelta);
    showXPAnim(Math.abs(xpDelta), isCorrect);

    setTimeout(() => {
      if (currentIndex + 1 < shuffledQuestions.length) {
        animateNext(() => {
          setCurrentIndex(prev => prev + 1);
          setSelectedAnswer(null);
        });
      } else {
        stopCountdown();
        setGameOver(true);
      }
    }, 1000);
  };

  const handleFinish = async () => {
    clearInterval(timerRef.current);
    await stopCountdown();
    if (xp > 0) {
      const data = await AsyncStorage.getItem('psiko_xp');
      const current = data ? parseInt(data) : 0;
      await AsyncStorage.setItem('psiko_xp', (current + xp).toString());
    }
    navigation.replace('ChallengeResult', { score, total: currentIndex + 1, xp, timeLeft });
  };

  useEffect(() => {
    if (gameOver) handleFinish();
  }, [gameOver]);

  const getTimerColor = () => {
    if (timeLeft <= 10) return '#dc3545';
    if (timeLeft <= 30) return '#fdcb6e';
    return '#5fffaa';
  };

  const getOptionState = (index) => {
    if (selectedAnswer === null) return null;
    if (index === current.correctAnswer) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return null;
  };

  if (!current || gameOver) return null;

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.timerBox}>
            <Text style={[styles.timerText, { color: getTimerColor() }]}>⏱ {timeLeft}s</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>✅ {score}</Text>
          </View>
          <View style={styles.xpBox}>
            <Text style={styles.xpText}>⚡ {xp} XP</Text>
          </View>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, {
            width: `${(timeLeft / TOTAL_TIME) * 100}%`,
            backgroundColor: getTimerColor(),
          }]} />
        </View>

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <View style={styles.card}>
            <Text style={styles.questionNumber}>Soru {currentIndex + 1}</Text>
            <Text style={styles.complaint}>{current.complaint}</Text>
          </View>

          <Text style={styles.question}>{current.question}</Text>

          {current.options.map((option, index) => (
            <OptionButton
              key={index}
              label={option}
              onPress={() => handleAnswer(index)}
              state={getOptionState(index)}
            />
          ))}
        </Animated.View>
      </ScrollView>

      {xpChange && (
        <Animated.View style={[
          styles.xpPopup,
          { backgroundColor: xpChange.isPositive ? 'rgba(0,184,148,0.95)' : 'rgba(220,53,69,0.95)' },
          {
            opacity: xpAnim,
            transform: [
              { scale: xpAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 1] }) },
              { translateY: xpAnim.interpolate({ inputRange: [0, 1], outputRange: [20, -10] }) },
            ]
          }
        ]}>
          <Text style={styles.xpPopupText}>
            {xpChange.isPositive ? `+${xpChange.amount} XP ⚡` : `-${xpChange.amount} XP 💔`}
          </Text>
        </Animated.View>
      )}
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 10 },
  timerBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  timerText: { fontSize: 18, fontWeight: 'bold' },
  scoreBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#5fffaa' },
  xpBox: { backgroundColor: 'rgba(168,85,247,0.3)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  xpText: { fontSize: 16, fontWeight: 'bold', color: '#a855f7' },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  card: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  questionNumber: { fontSize: 13, color: '#a855f7', fontWeight: '600', marginBottom: 8 },
  complaint: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  question: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 14 },
  xpPopup: { position: 'absolute', bottom: 60, alignSelf: 'center', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, borderWidth: 2, borderColor: '#fff', elevation: 10 },
  xpPopupText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});