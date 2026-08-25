import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import ThemedBackground from '../components/ThemedBackground';

export default function CalculatorScreen() {
  const [activeTab, setActiveTab] = useState('basic');
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Basit hesap makinesi
  const handleNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) { setDisplay('0.'); setWaitingForOperand(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const handleOperator = (op) => {
    const current = parseFloat(display);
    if (prevValue !== null && !waitingForOperand) {
      const result = calculate(prevValue, current, operator);
      setDisplay(String(result));
      setPrevValue(result);
    } else {
      setPrevValue(current);
    }
    setOperator(op);
    setWaitingForOperand(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prevValue === null || operator === null) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operator);
    setDisplay(String(parseFloat(result.toFixed(8))));
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  };

  const handleClear = () => {
    setDisplay('0'); setPrevValue(null); setOperator(null); setWaitingForOperand(false);
  };

  const handleToggleSign = () => setDisplay(String(parseFloat(display) * -1));
  const handlePercent = () => setDisplay(String(parseFloat(display) / 100));

  const buttons = [
    ['AC', '+/-', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  // Akademik hesap makinesi
  const [grades, setGrades] = useState([{ grade: '', credit: '' }]);
  const [scoreItems, setScoreItems] = useState([{ name: '', score: '', max: '' }]);
  const [gpa, setGpa] = useState(null);
  const [percentage, setPercentage] = useState(null);

  const addGrade = () => setGrades([...grades, { grade: '', credit: '' }]);
  const updateGrade = (index, field, value) => {
    const newGrades = [...grades];
    newGrades[index][field] = value;
    setGrades(newGrades);
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    grades.forEach(g => {
      const grade = parseFloat(g.grade);
      const credit = parseFloat(g.credit);
      if (!isNaN(grade) && !isNaN(credit)) {
        totalPoints += grade * credit;
        totalCredits += credit;
      }
    });
    if (totalCredits === 0) return;
    setGpa((totalPoints / totalCredits).toFixed(2));
  };

  const addScoreItem = () => setScoreItems([...scoreItems, { name: '', score: '', max: '' }]);
  const updateScoreItem = (index, field, value) => {
    const newItems = [...scoreItems];
    newItems[index][field] = value;
    setScoreItems(newItems);
  };

  const calculatePercentage = () => {
    let totalScore = 0;
    let totalMax = 0;
    scoreItems.forEach(item => {
      const score = parseFloat(item.score);
      const max = parseFloat(item.max);
      if (!isNaN(score) && !isNaN(max)) {
        totalScore += score;
        totalMax += max;
      }
    });
    if (totalMax === 0) return;
    setPercentage(((totalScore / totalMax) * 100).toFixed(1));
  };

  return (
    <ThemedBackground>
      <View style={styles.container}>
        <Text style={styles.title}>🧮 Hesap Makinesi</Text>

        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, activeTab === 'basic' && styles.tabActive]} onPress={() => setActiveTab('basic')}>
            <Text style={styles.tabText}>Standart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'academic' && styles.tabActive]} onPress={() => setActiveTab('academic')}>
            <Text style={styles.tabText}>Akademik</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'basic' && (
          <View style={styles.calcContainer}>
            <View style={styles.displayBox}>
              {operator && <Text style={styles.operatorDisplay}>{prevValue} {operator}</Text>}
              <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>{display}</Text>
            </View>
            {buttons.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.buttonRow}>
                {row.map((btn) => {
                  const isOperator = ['÷', '×', '-', '+', '='].includes(btn);
                  const isSpecial = ['AC', '+/-', '%'].includes(btn);
                  const isZero = btn === '0';
                  return (
                    <TouchableOpacity
                      key={btn}
                      style={[
                        styles.calcBtn,
                        isOperator && styles.calcBtnOperator,
                        isSpecial && styles.calcBtnSpecial,
                        isZero && styles.calcBtnZero,
                      ]}
                      onPress={() => {
                        if (btn === 'AC') handleClear();
                        else if (btn === '+/-') handleToggleSign();
                        else if (btn === '%') handlePercent();
                        else if (btn === '=') handleEquals();
                        else if (['+', '-', '×', '÷'].includes(btn)) handleOperator(btn);
                        else if (btn === '.') handleDecimal();
                        else handleNumber(btn);
                      }}
                    >
                      <Text style={[styles.calcBtnText, isOperator && styles.calcBtnTextOperator]}>{btn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'academic' && (
          <ScrollView contentContainerStyle={styles.academicContainer}>
            <Text style={styles.sectionTitle}>📊 Not Ortalaması (GPA)</Text>
            {grades.map((g, index) => (
              <View key={index} style={styles.gradeRow}>
                <TextInput
                  style={[styles.academicInput, { flex: 2 }]}
                  placeholder="Not (0-4)"
                  placeholderTextColor="#aaa"
                  value={g.grade}
                  onChangeText={(v) => updateGrade(index, 'grade', v)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.academicInput, { flex: 1 }]}
                  placeholder="Kredi"
                  placeholderTextColor="#aaa"
                  value={g.credit}
                  onChangeText={(v) => updateGrade(index, 'credit', v)}
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => setGrades(grades.filter((_, i) => i !== index))}>
                  <Text style={{ color: '#ff8080', fontSize: 18, padding: 8 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addRowBtn} onPress={addGrade}>
              <Text style={styles.addRowBtnText}>+ Ders Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculateBtn} onPress={calculateGPA}>
              <Text style={styles.calculateBtnText}>Hesapla</Text>
            </TouchableOpacity>
            {gpa && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Not Ortalamanız</Text>
                <Text style={styles.resultValue}>{gpa}</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>📈 Puan / Yüzde Hesaplama</Text>
            {scoreItems.map((item, index) => (
              <View key={index} style={styles.gradeRow}>
                <TextInput style={[styles.academicInput, { flex: 2 }]} placeholder="Puan" placeholderTextColor="#aaa" value={item.score} onChangeText={(v) => updateScoreItem(index, 'score', v)} keyboardType="numeric" />
                <TextInput style={[styles.academicInput, { flex: 2 }]} placeholder="Tam Puan" placeholderTextColor="#aaa" value={item.max} onChangeText={(v) => updateScoreItem(index, 'max', v)} keyboardType="numeric" />
                <TouchableOpacity onPress={() => setScoreItems(scoreItems.filter((_, i) => i !== index))}>
                  <Text style={{ color: '#ff8080', fontSize: 18, padding: 8 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addRowBtn} onPress={addScoreItem}>
              <Text style={styles.addRowBtnText}>+ Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calculateBtn} onPress={calculatePercentage}>
              <Text style={styles.calculateBtnText}>Hesapla</Text>
            </TouchableOpacity>
            {percentage && (
              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>Başarı Yüzdesi</Text>
                <Text style={styles.resultValue}>%{percentage}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16, marginTop: 10 },
  tabs: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  tabActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  tabText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  calcContainer: { flex: 1 },
  displayBox: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 20, marginBottom: 16, alignItems: 'flex-end' },
  operatorDisplay: { color: 'rgba(255,255,255,0.4)', fontSize: 18, marginBottom: 4 },
  display: { color: '#fff', fontSize: 52, fontWeight: '300' },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  calcBtn: { flex: 1, aspectRatio: 1, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  calcBtnZero: { flex: 2.2, aspectRatio: undefined, borderRadius: 50, paddingHorizontal: 20, alignItems: 'flex-start', paddingLeft: 28 },
  calcBtnOperator: { backgroundColor: '#a855f7' },
  calcBtnSpecial: { backgroundColor: 'rgba(255,255,255,0.25)' },
  calcBtnText: { color: '#fff', fontSize: 22, fontWeight: '500' },
  calcBtnTextOperator: { color: '#fff', fontWeight: '600' },
  academicContainer: { paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  gradeRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  academicInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  addRowBtn: { backgroundColor: 'rgba(168,85,247,0.2)', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)' },
  addRowBtnText: { color: '#a855f7', fontWeight: '600' },
  calculateBtn: { backgroundColor: '#a855f7', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  calculateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultBox: { backgroundColor: 'rgba(0,184,148,0.2)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#00b894', marginBottom: 8 },
  resultLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 4 },
  resultValue: { color: '#00b894', fontSize: 36, fontWeight: 'bold' },
});