import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCoins } from '../hooks/useCoins';
import { puzzles } from '../data/puzzles';
import ThemedBackground from '../components/ThemedBackground';

const { width } = Dimensions.get('window');
const GRID = 5;
const PIECE_COST = 12;
const TOTAL_PIECES = GRID * GRID;

export default function PuzzleScreen() {
  const { coins, spendCoins, loadCoins } = useCoins();
  const [puzzleStates, setPuzzleStates] = useState({});
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedPuzzle, setCompletedPuzzle] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_puzzles');
      if (data) setPuzzleStates(JSON.parse(data));
      loadCoins();
    } catch (e) {}
  };

  const getPuzzleState = (puzzleId) => {
    return puzzleStates[puzzleId] || { unlockedPieces: [] };
  };

  const buyPiece = async (puzzle) => {
    const state = getPuzzleState(puzzle.id);
    const nextPiece = state.unlockedPieces.length;

    if (nextPiece >= TOTAL_PIECES) {
      Alert.alert('Tamamlandı!', 'Bu puzzle zaten tamamlandı!');
      return;
    }

    if (coins < PIECE_COST) {
      Alert.alert('Yetersiz Coin!', `Bir parça için ${PIECE_COST} coin gerekiyor. Şu an ${coins} coinin var. Daha fazla soru çözerek coin kazan!`);
      return;
    }

    Alert.alert(
      'Parça Satın Al',
      `${PIECE_COST} coin harcayarak bir parça açmak istiyor musun?\n\nKalan: ${TOTAL_PIECES - nextPiece - 1} parça`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Satın Al', onPress: async () => {
            const success = await spendCoins(PIECE_COST);
            if (success) {
              const newState = {
                ...puzzleStates,
                [puzzle.id]: {
                  unlockedPieces: [...state.unlockedPieces, nextPiece],
                }
              };
              await AsyncStorage.setItem('psiko_puzzles', JSON.stringify(newState));
              setPuzzleStates(newState);

              if (nextPiece + 1 >= TOTAL_PIECES) {
                setCompletedPuzzle(puzzle);
                setShowCompleteModal(true);
              }
            }
          }
        },
      ]
    );
  };

  const pieceSize = (width - 48) / GRID;

  const renderPuzzleGrid = (puzzle) => {
    const state = getPuzzleState(puzzle.id);
    const unlockedCount = state.unlockedPieces.length;
    const isCompleted = unlockedCount >= TOTAL_PIECES;

    return (
      <View style={styles.puzzleContainer}>
        <View style={styles.grid}>
          {Array.from({ length: TOTAL_PIECES }).map((_, index) => {
            const row = Math.floor(index / GRID);
            const col = index % GRID;
            const isUnlocked = state.unlockedPieces.includes(index);

            return (
              <View
                key={index}
                style={[styles.piece, { width: pieceSize, height: pieceSize }]}
              >
                {isUnlocked ? (
                  <Image
                    source={puzzle.image}
                    style={{
                      width: pieceSize * GRID,
                      height: pieceSize * GRID,
                      position: 'absolute',
                      left: -col * pieceSize,
                      top: -row * pieceSize,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.lockedPiece}>
                    <Text style={styles.lockedIcon}>🔒</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.puzzleInfo}>
          <Text style={styles.puzzleProgress}>{unlockedCount} / {TOTAL_PIECES} parça açıldı</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(unlockedCount / TOTAL_PIECES) * 100}%` }]} />
          </View>
        </View>

        {!isCompleted && (
          <TouchableOpacity style={styles.buyBtn} onPress={() => buyPiece(puzzle)}>
            <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.buyBtnGradient}>
              <Text style={styles.buyBtnText}>🪙 {PIECE_COST} — Parça Satın Al</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✅ Tamamlandı!</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🧩 Puzzle</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {coins}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Soru çözerek coin kazan, puzzle parçalarını aç!</Text>

        {selectedPuzzle === null ? (
          <>
            <Text style={styles.sectionTitle}>Puzzle Seç</Text>
            {puzzles.map(puzzle => {
              const state = getPuzzleState(puzzle.id);
              const unlockedCount = state.unlockedPieces.length;
              const isCompleted = unlockedCount >= TOTAL_PIECES;
              return (
                <TouchableOpacity
                  key={puzzle.id}
                  style={styles.puzzleCard}
                  onPress={() => setSelectedPuzzle(puzzle)}
                >
                  <Image source={puzzle.image} style={styles.puzzleThumb} resizeMode="cover" />
                  <View style={styles.puzzleCardOverlay} />
                  <View style={styles.puzzleCardInfo}>
                    <Text style={styles.puzzleCardName}>{puzzle.name}</Text>
                    <Text style={styles.puzzleCardLocation}>📍 {puzzle.location}</Text>
                    <Text style={styles.puzzleCardProgress}>
                      {isCompleted ? '✅ Tamamlandı' : `${unlockedCount}/${TOTAL_PIECES} parça`}
                    </Text>
                    <View style={styles.miniProgressBg}>
                      <View style={[styles.miniProgressFill, { width: `${(unlockedCount / TOTAL_PIECES) * 100}%` }]} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedPuzzle(null)}>
              <Text style={styles.backBtnText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.puzzleTitle}>{selectedPuzzle.name}</Text>
            <Text style={styles.puzzleLocation}>📍 {selectedPuzzle.location}</Text>
            {renderPuzzleGrid(selectedPuzzle)}

            {getPuzzleState(selectedPuzzle.id).unlockedPieces.length >= TOTAL_PIECES && (
              <View style={styles.factBox}>
                <Text style={styles.factTitle}>🌍 Genel Kültür</Text>
                <Text style={styles.factText}>{selectedPuzzle.fact}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showCompleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Puzzle Tamamlandı!</Text>
            {completedPuzzle && (
              <>
                <Image source={completedPuzzle.image} style={styles.modalImage} resizeMode="cover" />
                <Text style={styles.modalName}>{completedPuzzle.name}</Text>
                <Text style={styles.modalLocation}>📍 {completedPuzzle.location}</Text>
                <Text style={styles.modalFact}>{completedPuzzle.fact}</Text>
              </>
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowCompleteModal(false)}>
              <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.buyBtnGradient}>
                <Text style={styles.buyBtnText}>Harika! 🌟</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  coinBadge: { backgroundColor: 'rgba(253,203,110,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#fdcb6e' },
  coinText: { color: '#fdcb6e', fontWeight: 'bold', fontSize: 16 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  puzzleCard: { borderRadius: 20, marginBottom: 16, overflow: 'hidden', height: 160 },
  puzzleThumb: { width: '100%', height: '100%', position: 'absolute' },
  puzzleCardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  puzzleCardInfo: { flex: 1, padding: 16, justifyContent: 'flex-end' },
  puzzleCardName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  puzzleCardLocation: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  puzzleCardProgress: { fontSize: 12, color: '#fdcb6e', fontWeight: '600', marginBottom: 4 },
  miniProgressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  miniProgressFill: { height: 4, backgroundColor: '#a855f7', borderRadius: 2 },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: '#a855f7', fontSize: 16, fontWeight: '600' },
  puzzleTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  puzzleLocation: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  puzzleContainer: { marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  piece: { overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  lockedPiece: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  lockedIcon: { fontSize: 14 },
  puzzleInfo: { marginTop: 12, marginBottom: 12 },
  puzzleProgress: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: '#a855f7', borderRadius: 3 },
  buyBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  buyBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  completedBadge: { backgroundColor: 'rgba(0,184,148,0.2)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#00b894', marginTop: 4 },
  completedText: { color: '#00b894', fontSize: 16, fontWeight: 'bold' },
  factBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: 18, marginTop: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  factTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  factText: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1e1e5e', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(168,85,247,0.5)', maxHeight: '90%' },
  modalEmoji: { fontSize: 50, marginBottom: 8 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  modalImage: { width: '100%', height: 180, borderRadius: 16, marginBottom: 12 },
  modalName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  modalLocation: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 12 },
  modalFact: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 20, textAlign: 'center' },
  modalBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
});