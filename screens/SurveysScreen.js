import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import ThemedBackground from '../components/ThemedBackground';

export default function SurveysScreen() {
  const [surveys, setSurveys] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDesc, setSurveyDesc] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [answers, setAnswers] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);

  useEffect(() => { loadSurveys(); }, []);

  const loadSurveys = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_surveys');
      if (data) setSurveys(JSON.parse(data));
    } catch (e) {}
  };

  const saveSurveys = async (newSurveys) => {
    await AsyncStorage.setItem('psiko_surveys', JSON.stringify(newSurveys));
    setSurveys(newSurveys);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf erişimi için izin vermeniz gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploadedImage(result.assets[0].uri);
      setUploadedDoc(null);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled) {
      setUploadedImage(result.assets[0].uri);
      setUploadedDoc(null);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        setUploadedDoc(result.assets[0]);
        setUploadedImage(null);
      }
    } catch (e) {
      Alert.alert('Hata', 'Dosya seçilemedi.');
    }
  };

  const handleCreateSurvey = async () => {
    if (!surveyTitle.trim() && !uploadedImage && !uploadedDoc) {
      return Alert.alert('Uyarı', 'Anket başlığı veya dosya ekle!');
    }

    const validQuestions = questions.filter(q => q.trim());
    const newSurvey = {
      id: Date.now().toString(),
      title: surveyTitle.trim() || (uploadedDoc?.name || 'Yüklenen Anket'),
      description: surveyDesc.trim(),
      questions: validQuestions,
      image: uploadedImage || null,
      document: uploadedDoc ? { name: uploadedDoc.name, uri: uploadedDoc.uri } : null,
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };

    await saveSurveys([...surveys, newSurvey]);
    setSurveyTitle('');
    setSurveyDesc('');
    setQuestions(['']);
    setUploadedImage(null);
    setUploadedDoc(null);
    setShowCreateModal(false);
  };

  const handleDeleteSurvey = (id) => {
    Alert.alert('Anketi Sil', 'Bu anketi silmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => await saveSurveys(surveys.filter(s => s.id !== id)) }
    ]);
  };

  const openSurvey = (survey) => {
    setSelectedSurvey(survey);
    setAnswers({});
    setShowSurveyModal(true);
  };

  const addQuestion = () => setQuestions([...questions, '']);
  const updateQuestion = (index, text) => {
    const newQ = [...questions];
    newQ[index] = text;
    setQuestions(newQ);
  };
  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const showUploadOptions = () => {
    Alert.alert('Anket Yükle', 'Nasıl yüklemek istersin?', [
      { text: 'Fotoğraf Çek', onPress: takePhoto },
      { text: 'Galeriden Seç', onPress: pickImage },
      { text: 'Dosya Seç (PDF/Word)', onPress: pickDocument },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Anketlerim</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreateModal(true)}>
            <Text style={styles.addBtnText}>+ Yeni</Text>
          </TouchableOpacity>
        </View>

        {surveys.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>Henüz anket yok. İlk anketini oluştur!</Text>
          </View>
        ) : (
          surveys.map(survey => (
            <TouchableOpacity key={survey.id} style={styles.surveyCard} onPress={() => openSurvey(survey)}>
              {survey.image && (
                <Image source={{ uri: survey.image }} style={styles.surveyImage} resizeMode="cover" />
              )}
              <View style={styles.surveyHeader}>
                <Text style={styles.surveyTitle}>{survey.title}</Text>
                <TouchableOpacity onPress={() => handleDeleteSurvey(survey.id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
              {survey.description ? <Text style={styles.surveyDesc}>{survey.description}</Text> : null}
              {survey.document && <Text style={styles.docBadge}>📄 {survey.document.name}</Text>}
              <Text style={styles.surveyMeta}>
                {survey.questions.length > 0 ? `📝 ${survey.questions.length} soru • ` : ''}{survey.createdAt}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Anket Oluşturma Modalı */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Yeni Anket</Text>
            <ScrollView showsVerticalScrollIndicator={false}>

              <TouchableOpacity style={styles.uploadBtn} onPress={showUploadOptions}>
                <Text style={styles.uploadBtnText}>📎 Fotoğraf / Dosya Yükle</Text>
              </TouchableOpacity>

              {uploadedImage && (
                <View style={styles.previewBox}>
                  <Image source={{ uri: uploadedImage }} style={styles.previewImage} resizeMode="contain" />
                  <TouchableOpacity onPress={() => setUploadedImage(null)}>
                    <Text style={styles.removePreview}>✕ Kaldır</Text>
                  </TouchableOpacity>
                </View>
              )}

              {uploadedDoc && (
                <View style={styles.docPreview}>
                  <Text style={styles.docPreviewText}>📄 {uploadedDoc.name}</Text>
                  <TouchableOpacity onPress={() => setUploadedDoc(null)}>
                    <Text style={styles.removePreview}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TextInput style={styles.input} placeholder="Anket Başlığı" placeholderTextColor="#aaa" value={surveyTitle} onChangeText={setSurveyTitle} />
              <TextInput style={styles.input} placeholder="Açıklama (isteğe bağlı)" placeholderTextColor="#aaa" value={surveyDesc} onChangeText={setSurveyDesc} />

              <Text style={styles.sectionLabel}>Sorular:</Text>
              {questions.map((q, index) => (
                <View key={index} style={styles.questionRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder={`Soru ${index + 1}`}
                    placeholderTextColor="#aaa"
                    value={q}
                    onChangeText={(text) => updateQuestion(index, text)}
                    multiline
                  />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeQuestion(index)}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addQuestionBtn} onPress={addQuestion}>
                <Text style={styles.addQuestionBtnText}>+ Soru Ekle</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => {
                  setShowCreateModal(false);
                  setUploadedImage(null);
                  setUploadedDoc(null);
                }}>
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateSurvey}>
                  <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.saveBtnGradient}>
                    <Text style={styles.saveBtnText}>Oluştur</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Anket Görüntüleme Modalı */}
      <Modal visible={showSurveyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedSurvey && (
              <>
                <Text style={styles.modalTitle}>{selectedSurvey.title}</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
                  {selectedSurvey.image && (
                    <Image source={{ uri: selectedSurvey.image }} style={styles.surveyFullImage} resizeMode="contain" />
                  )}
                  {selectedSurvey.document && (
                    <View style={styles.docPreview}>
                      <Text style={styles.docPreviewText}>📄 {selectedSurvey.document.name}</Text>
                    </View>
                  )}
                  {selectedSurvey.description ? <Text style={styles.surveyDesc}>{selectedSurvey.description}</Text> : null}
                  {selectedSurvey.questions.map((q, index) => (
                    <View key={index} style={styles.answerBox}>
                      <Text style={styles.questionText}>{index + 1}. {q}</Text>
                      <TextInput
                        style={styles.answerInput}
                        placeholder="Cevabını yaz..."
                        placeholderTextColor="#aaa"
                        value={answers[index] || ''}
                        onChangeText={(text) => setAnswers({ ...answers, [index]: text })}
                        multiline
                      />
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSurveyModal(false)}>
                    <Text style={styles.cancelBtnText}>Kapat</Text>
                  </TouchableOpacity>
                  {selectedSurvey.questions.length > 0 && (
                    <TouchableOpacity style={styles.saveBtn} onPress={() => {
                      Alert.alert('✅ Tamamlandı!', 'Anket cevapların kaydedildi.');
                      setShowSurveyModal(false);
                    }}>
                      <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.saveBtnGradient}>
                        <Text style={styles.saveBtnText}>Tamamla</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#a855f7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 15, textAlign: 'center' },
  surveyCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderLeftWidth: 4, borderLeftColor: '#a855f7', overflow: 'hidden' },
  surveyImage: { width: '100%', height: 150 },
  surveyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 6 },
  surveyTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', flex: 1 },
  deleteBtn: { fontSize: 18 },
  surveyDesc: { fontSize: 13, color: 'rgba(255,255,255,0.6)', paddingHorizontal: 16, marginBottom: 6 },
  docBadge: { fontSize: 12, color: '#a855f7', paddingHorizontal: 16, marginBottom: 6 },
  surveyMeta: { fontSize: 12, color: '#a855f7', fontWeight: '600', paddingHorizontal: 16, paddingBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1e1e5e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  uploadBtn: { backgroundColor: 'rgba(168,85,247,0.2)', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)', borderStyle: 'dashed' },
  uploadBtnText: { color: '#a855f7', fontWeight: '600', fontSize: 15 },
  previewBox: { alignItems: 'center', marginBottom: 12 },
  previewImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 8 },
  removePreview: { color: '#ff8080', fontWeight: '600' },
  docPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 10, padding: 10, marginBottom: 12, justifyContent: 'space-between' },
  docPreviewText: { color: '#a855f7', fontSize: 13, flex: 1 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  sectionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  removeBtn: { backgroundColor: 'rgba(220,53,69,0.3)', borderRadius: 8, padding: 10 },
  removeBtnText: { color: '#ff8080', fontWeight: 'bold' },
  addQuestionBtn: { backgroundColor: 'rgba(168,85,247,0.2)', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)' },
  addQuestionBtnText: { color: '#a855f7', fontWeight: '600' },
  surveyFullImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 12 },
  answerBox: { marginBottom: 14 },
  questionText: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  answerInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', minHeight: 60 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontSize: 16 },
  saveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  saveBtnGradient: { padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});