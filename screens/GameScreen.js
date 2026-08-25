import ThemedBackground from '../components/ThemedBackground';
import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Modal, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer } from 'expo-audio';
import { questions, mainCategories, units } from '../data/questions';
import OptionButton from '../components/OptionButton';
import { useStats } from '../hooks/useStats';
import { useXP } from '../hooks/useXP';
import { useCoins } from '../hooks/useCoins';
import { useNotes } from '../hooks/useNotes';

const { height } = Dimensions.get('window');

export default function GameScreen({ navigation, route }) {
  const { unitId, unitName } = route.params;
  const { saveResult, updateLevel } = useStats();
  const { addXP } = useXP();
  const { addCoins } = useCoins();
  const { addNote } = useNotes();

  const [filteredQuestions] = useState(() => {
    try {
      let pool = unitId === 'all' ? [...questions] : questions.filter(q => q.mainCategory === unitId);
      if (!pool || pool.length === 0) pool = [...questions];
      return pool.sort(() => Math.random() - 0.5).slice(0, 10);
    } catch (e) { return []; }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const selectedAnswer = answers[currentIndex] ?? null;  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [correctUnits, setCorrectUnits] = useState([]);
  const [streak, setStreak] = useState(0);
  const [xpGained, setXpGained] = useState(null);
  const [xpAnim] = useState(new Animated.Value(0));
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const current = filteredQuestions[currentIndex];
  const correctPlayer = useAudioPlayer(require('../assets/sounds/correct.wav'));
  const wrongPlayer = useAudioPlayer(require('../assets/sounds/wrong.wav'));

  const showXPAnim = (amount) => {
    setXpGained(amount);
    xpAnim.setValue(0);
    Animated.sequence([
      Animated.spring(xpAnim, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(xpAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setXpGained(null));
  };

  const handleAnswer = async (index) => {
    if (selectedAnswer !== null) return;
  setAnswers(prev => ({ ...prev, [currentIndex]: index }));
    const isCorrect = index === current.correctAnswer;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(prev => prev + 1);
      setCorrectUnits(prev => [...prev, current.mainCategory]);
      const { xpGained: gained } = await addXP(true, newStreak);
      showXPAnim(gained);
      await addCoins(10);
      try {
        correctPlayer.seekTo(0);
        correctPlayer.play();
      } catch (e) {}
    } else {
      setStreak(0);
      await addXP(false, 0);
      setWrongAnswers(prev => [...prev, { unit: current.mainCategory, question: current.question }]);
      try {
        wrongPlayer.seekTo(0);
        wrongPlayer.play();
      } catch (e) {}
    }
  };

  const handleNext = async () => {
    const isLast = currentIndex + 1 >= filteredQuestions.length;
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await saveResult(wrongAnswers, correctUnits);
      const levelResult = unitId !== 'all'
        ? await updateLevel(unitId, score, filteredQuestions.length)
        : { leveledUp: false };
      navigation.navigate('Result', { score, total: filteredQuestions.length, unitName, unitId, wrongAnswers, levelResult });
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    await addNote(noteTitle.trim() || unitName + ' — Not', noteContent, current.mainCategory, '#a855f7');
    setNoteTitle(''); setNoteContent(''); setShowNoteModal(false);
  };

  const getOptionState = (index) => {
    if (selectedAnswer === null) return null;
    if (index === current.correctAnswer) return 'correct';
    if (index === selectedAnswer) return 'wrong';
    return null;
  };

  if (!current) return (
  <ThemedBackground>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 16 }}>Sorular yükleniyor...</Text>
    </View>
  </ThemedBackground>
  );

  const progress = (currentIndex + 1) / filteredQuestions.length;

  return (
    <ThemedBackground>
      <View style={styles.wrapper}>
        {/* Üst bar */}
        <View style={styles.topBar}>
          <Text style={styles.unitLabel} numberOfLines={1}>{unitName}</Text>
          <View style={styles.topRight}>
            {streak >= 3 && <Text style={styles.streakText}>🔥 {streak}</Text>}
            <TouchableOpacity style={styles.noteBtn} onPress={() => setShowNoteModal(true)}>
              <Text style={styles.noteBtnText}>📝</Text>
            </TouchableOpacity>
            <Text style={styles.progress}>{currentIndex + 1} / {filteredQuestions.length}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>

        {/* Vaka metni - sabit yükseklik, kendi içinde kaydırılabilir */}
        <View style={styles.card}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={styles.complaintScroll}>
        <Text style={styles.complaint}>{current?.complaint?.replace('Tanı aşağıdakilerden hangisidir?', '').trim()}</Text>          
        </ScrollView>
        </View>

        {/* Soru */}
        <Text style={styles.question}>{current?.question ?? ''}</Text>
        {/* Seçenekler + açıklama - kaydırılabilir */}
        <ScrollView style={styles.optionsScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {(current?.options ?? []).map((option, index) => (
              <OptionButton
              key={index}
              label={option}
              onPress={() => handleAnswer(index)}
              state={getOptionState(index)}
            />
          ))}

          {selectedAnswer !== null && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>
                {selectedAnswer === current.correctAnswer ? '✅ Doğru!' : '❌ Yanlış!'}
              </Text>
              {selectedAnswer !== current.correctAnswer && (
                <Text style={styles.explanationText}>{current?.explanation}</Text>
              )}
              {selectedAnswer === current.correctAnswer && (
                <Text style={styles.explanationText}>Harika! Bu soruyu doğru bildin. 🎉</Text>
              )}
              <View style={styles.navRow}>
                {currentIndex > 0 ? (
                  <TouchableOpacity onPress={() => setCurrentIndex(currentIndex - 1)}>
                    <Text style={styles.prevButton}>← Önceki Soru</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                <TouchableOpacity onPress={handleNext}>
                  <Text style={styles.nextButton}>
                    {currentIndex + 1 < filteredQuestions.length ? 'Sonraki Soru →' : 'Sonuçları Gör →'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {xpGained && (
        <Animated.View style={[styles.xpPopup, {
          opacity: xpAnim,
          transform: [
            { scale: xpAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 1] }) },
            { translateY: xpAnim.interpolate({ inputRange: [0, 1], outputRange: [20, -10] }) },
          ]
        }]}>
          <Text style={styles.xpPopupText}>+{xpGained} XP {xpGained > 50 ? '🔥' : '⭐'}</Text>
        </Animated.View>
      )}

      <Modal visible={showNoteModal} transparent animationType="slide">
        <View style={styles.noteModalOverlay}>
          <View style={styles.noteModalBox}>
            <Text style={styles.noteModalTitle}>📝 Not Al</Text>
            <Text style={styles.noteModalTag}>#{unitName}</Text>
            <TextInput style={styles.noteInput} placeholder="Başlık (isteğe bağlı)" placeholderTextColor="#aaa" value={noteTitle} onChangeText={setNoteTitle} />
            <TextInput style={[styles.noteInput, styles.noteTextArea]} placeholder="Notunu buraya yaz..." placeholderTextColor="#aaa" value={noteContent} onChangeText={setNoteContent} multiline numberOfLines={6} textAlignVertical="top" />
            <View style={styles.noteModalButtons}>
              <TouchableOpacity style={styles.noteCancelBtn} onPress={() => { setNoteTitle(''); setNoteContent(''); setShowNoteModal(false); }}>
                <Text style={styles.noteCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noteSaveBtn} onPress={handleSaveNote}>
                <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.noteSaveBtnGradient}>
                  <Text style={styles.noteSaveText}>Kaydet</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unitLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', flex: 1, marginRight: 10 },
  progress: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  streakText: { fontSize: 16, fontWeight: 'bold', color: '#fdcb6e' },
  noteBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  noteBtnText: { fontSize: 18 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#a855f7', borderRadius: 3 },
  card: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', height: height * 0.2 },  
  complaintScroll: { flex: 1 },
  complaint: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  question: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  optionsScroll: { flex: 1 },
  explanationBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  explanationTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  explanationText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: 14 },
  nextButton: { fontSize: 16, fontWeight: 'bold', color: '#a855f7', textAlign: 'right' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  prevButton: { fontSize: 16, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' },
  xpPopup: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: 'rgba(168,85,247,0.95)', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, borderWidth: 2, borderColor: '#fff', elevation: 10 },
  xpPopupText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  noteModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  noteModalBox: { backgroundColor: '#1e1e5e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  noteModalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
  noteModalTag: { fontSize: 13, color: '#a855f7', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  noteInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  noteTextArea: { height: 140 },
  noteModalButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  noteCancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  noteCancelText: { color: '#fff', fontSize: 16 },
  noteSaveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  noteSaveBtnGradient: { padding: 14, alignItems: 'center' },
  noteSaveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});