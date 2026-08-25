import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedBackground from '../components/ThemedBackground';

const SESSION_TYPES = [
  { label: 'İlk Seans', color: '#0984e3' },
  { label: 'Takip Seansı', color: '#00b894' },
  { label: 'Acil', color: '#e17055' },
  { label: 'Online', color: '#a855f7' },
  { label: 'Değerlendirme', color: '#fdcb6e' },
];

const toISO = (dateStr) => {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
};

const toDisplay = (isoStr) => {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [clientName, setClientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_appointments');
      if (data) setAppointments(JSON.parse(data));
    } catch (e) {}
  };

  const saveAppointments = async (newApps) => {
    try {
      await AsyncStorage.setItem('psiko_appointments', JSON.stringify(newApps));
      setAppointments(newApps);
    } catch (e) {
      Alert.alert('Hata', 'Kaydedilemedi!');
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setClientName('');
    setDate('');
    setTime('');
    setNotes('');
    setSessionType(SESSION_TYPES[0]);
    setShowModal(true);
  };

  const openEdit = (app) => {
    setEditingId(app.id);
    setClientName(app.clientName);
    setDate(app.displayDate || toDisplay(app.dateISO));
    setTime(app.time);
    setNotes(app.notes || '');
    setSessionType(SESSION_TYPES.find(s => s.label === app.sessionType) || SESSION_TYPES[0]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!clientName.trim() || !date.trim() || !time.trim()) {
      Alert.alert('Uyarı', 'Danışan adı, tarih ve saat zorunludur!');
      return;
    }
    const parts = date.trim().split('.');
    if (parts.length !== 3) {
      Alert.alert('Uyarı', 'Tarih formatı hatalı! Örnek: 15.07.2025');
      return;
    }
    const dateISO = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
    const normalizedTime = time.trim().replace('.', ':');

    const newApp = {
      id: editingId || Date.now().toString(),
      clientName: clientName.trim(),
      dateISO,
      displayDate: date.trim(),
      time: normalizedTime,
      notes: notes.trim(),
      sessionType: sessionType.label,
      color: sessionType.color,
    };

    let newApps;
    if (editingId) {
      newApps = appointments.map(a => a.id === editingId ? newApp : a);
    } else {
      newApps = [...appointments, newApp];
    }
    newApps.sort((a, b) => `${a.dateISO} ${a.time}`.localeCompare(`${b.dateISO} ${b.time}`));
    await saveAppointments(newApps);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Randevuyu Sil', 'Bu randevuyu silmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          await saveAppointments(appointments.filter(a => a.id !== id));
        }
      }
    ]);
  };

  const now = new Date();
  const upcoming = appointments.filter(a => {
    const iso = a.dateISO || toISO(a.date || '');
    const timeParts = (a.time || '00:00').split(':').map(Number);
    const h = timeParts[0] || 0;
    const m = timeParts[1] || 0;
    const appDate = new Date(iso);
    appDate.setHours(h, m, 0, 0);
    return appDate >= now;
  });

  const past = appointments.filter(a => {
    const iso = a.dateISO || toISO(a.date || '');
    const timeParts = (a.time || '00:00').split(':').map(Number);
    const h = timeParts[0] || 0;
    const m = timeParts[1] || 0;
    const appDate = new Date(iso);
    appDate.setHours(h, m, 0, 0);
    return appDate < now;
  });

  const displayList = activeTab === 'upcoming' ? upcoming : past;

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Randevularım</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Ekle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={styles.tabText}>Yaklaşan ({upcoming.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'past' && styles.tabActive]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={styles.tabText}>Geçmiş ({past.length})</Text>
          </TouchableOpacity>
        </View>

        {displayList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' ? 'Yaklaşan randevu yok.' : 'Geçmiş randevu yok.'}
            </Text>
          </View>
        ) : (
          displayList.map(app => (
            <TouchableOpacity
              key={app.id}
              style={[styles.appCard, { borderLeftColor: app.color }]}
              onPress={() => openEdit(app)}
            >
              <View style={styles.appHeader}>
                <View style={[styles.typeBadge, { backgroundColor: app.color + '30', borderColor: app.color }]}>
                  <Text style={[styles.typeText, { color: app.color }]}>{app.sessionType}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(app.id)}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.clientName}>👤 {app.clientName}</Text>
              <Text style={styles.appDateTime}>
                📅 {app.displayDate || toDisplay(app.dateISO)} — ⏰ {app.time}
              </Text>
              {app.notes ? <Text style={styles.appNotes}>{app.notes}</Text> : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Randevuyu Düzenle' : 'Yeni Randevu'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Danışan Adı"
              placeholderTextColor="#aaa"
              value={clientName}
              onChangeText={setClientName}
            />
            <TextInput
              style={styles.input}
              placeholder="Tarih (örn: 15.07.2025)"
              placeholderTextColor="#aaa"
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Saat (örn: 14:30)"
              placeholderTextColor="#aaa"
              value={time}
              onChangeText={setTime}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notlar (isteğe bağlı)"
              placeholderTextColor="#aaa"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <Text style={styles.colorLabel}>Seans Türü:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {SESSION_TYPES.map(type => (
                <TouchableOpacity
                  key={type.label}
                  style={[
                    styles.typeChip,
                    { borderColor: type.color },
                    sessionType.label === type.label && { backgroundColor: type.color }
                  ]}
                  onPress={() => setSessionType(type)}
                >
                  <Text style={[
                    styles.typeChipText,
                    sessionType.label === type.label && { color: '#fff' }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.saveBtnGradient}>
                  <Text style={styles.saveBtnText}>Kaydet</Text>
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
  container: { padding: 20, flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#a855f7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  tabs: { flexDirection: 'row', marginBottom: 16, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  tabActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  tabText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
  appCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  typeText: { fontSize: 12, fontWeight: '600' },
  deleteBtn: { fontSize: 18 },
  clientName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  appDateTime: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  appNotes: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1e1e5e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  notesInput: { height: 80 },
  colorLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 10 },
  typeScroll: { marginBottom: 20 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, marginRight: 8, backgroundColor: 'transparent' },
  typeChipText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontSize: 16 },
  saveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  saveBtnGradient: { padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});