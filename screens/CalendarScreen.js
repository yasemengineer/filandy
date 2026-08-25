import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedBackground from '../components/ThemedBackground';

LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  monthNamesShort: ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dayNames: ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],
  dayNamesShort: ['Paz','Pzt','Sal','Çar','Per','Cum','Cts'],
  today: 'Bugün',
};
LocaleConfig.defaultLocale = 'tr';

const COLORS = ['#a855f7', '#0984e3', '#00b894', '#fdcb6e', '#e17055', '#fd79a8', '#00cec9'];

export default function CalendarScreen() {
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [eventText, setEventText] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_calendar');
      if (data) setEvents(JSON.parse(data));
    } catch (e) {}
  };

  const saveEvents = async (newEvents) => {
    await AsyncStorage.setItem('psiko_calendar', JSON.stringify(newEvents));
    setEvents(newEvents);
  };

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(events).forEach(date => {
      const dayEvents = events[date];
      if (dayEvents && dayEvents.length > 0) {
        marked[date] = {
          dots: dayEvents.map(e => ({ color: e.color })),
          marked: true,
        };
      }
    });
    if (selectedDate) {
      marked[selectedDate] = {
        ...(marked[selectedDate] || {}),
        selected: true,
        selectedColor: 'rgba(168,85,247,0.5)',
      };
    }
    marked[today] = {
      ...(marked[today] || {}),
      today: true,
    };
    return marked;
  };

  const openAddEvent = () => {
    if (!selectedDate) return Alert.alert('Uyarı', 'Önce bir gün seç!');
    setEditingId(null);
    setEventText('');
    setSelectedColor(COLORS[0]);
    setShowModal(true);
  };

  const openEditEvent = (event) => {
    setEditingId(event.id);
    setEventText(event.text);
    setSelectedColor(event.color);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!eventText.trim()) return Alert.alert('Uyarı', 'Not boş olamaz!');
    const dayEvents = events[selectedDate] || [];

    let newDayEvents;
    if (editingId) {
      newDayEvents = dayEvents.map(e => e.id === editingId ? { ...e, text: eventText, color: selectedColor } : e);
    } else {
      newDayEvents = [...dayEvents, { id: Date.now().toString(), text: eventText, color: selectedColor }];
    }

    await saveEvents({ ...events, [selectedDate]: newDayEvents });
    setShowModal(false);
  };

  const handleDelete = async (eventId) => {
    Alert.alert('Sil', 'Bu notu silmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          const newDayEvents = (events[selectedDate] || []).filter(e => e.id !== eventId);
          await saveEvents({ ...events, [selectedDate]: newDayEvents });
        }
      }
    ]);
  };

  const selectedEvents = selectedDate ? (events[selectedDate] || []) : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📅 Takvim</Text>

        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={getMarkedDates()}
            markingType="multi-dot"
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'rgba(255,255,255,0.08)',
              textSectionTitleColor: 'rgba(255,255,255,0.6)',
              selectedDayBackgroundColor: '#a855f7',
              selectedDayTextColor: '#fff',
              todayTextColor: '#a855f7',
              dayTextColor: '#fff',
              textDisabledColor: 'rgba(255,255,255,0.2)',
              dotColor: '#a855f7',
              arrowColor: '#a855f7',
              monthTextColor: '#fff',
              indicatorColor: '#a855f7',
            }}
            style={styles.calendar}
          />
        </View>

        {selectedDate ? (
          <View style={styles.eventsSection}>
            <View style={styles.eventsSectionHeader}>
              <Text style={styles.selectedDateText}>{formatDate(selectedDate)}</Text>
              <TouchableOpacity style={styles.addBtn} onPress={openAddEvent}>
                <Text style={styles.addBtnText}>+ Ekle</Text>
              </TouchableOpacity>
            </View>

            {selectedEvents.length === 0 ? (
              <Text style={styles.noEvent}>Bu güne not eklenmemiş.</Text>
            ) : (
              selectedEvents.map(event => (
                <TouchableOpacity key={event.id} style={[styles.eventCard, { borderLeftColor: event.color }]} onPress={() => openEditEvent(event)}>
                  <Text style={styles.eventText}>{event.text}</Text>
                  <TouchableOpacity onPress={() => handleDelete(event.id)}>
                    <Text style={styles.deleteBtn}>🗑️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : (
          <Text style={styles.hint}>Bir güne dokunarak not ekleyebilirsin.</Text>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingId ? 'Notu Düzenle' : 'Not Ekle'}</Text>
            <Text style={styles.modalDate}>{formatDate(selectedDate)}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Notunu yaz..."
              placeholderTextColor="#aaa"
              value={eventText}
              onChangeText={setEventText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.colorLabel}>Renk:</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && styles.colorSelected]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>

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
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16, marginTop: 10 },
  calendarWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  calendar: { borderRadius: 16 },
  eventsSection: { marginBottom: 20 },
  eventsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  selectedDateText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#a855f7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  noEvent: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontStyle: 'italic' },
  eventCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, marginBottom: 8, borderLeftWidth: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventText: { color: '#fff', fontSize: 14, flex: 1, lineHeight: 20 },
  deleteBtn: { fontSize: 18, marginLeft: 10 },
  hint: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 20, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1e1e5e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
  modalDate: { fontSize: 13, color: '#a855f7', textAlign: 'center', marginBottom: 16 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', minHeight: 100 },
  colorLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 10 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  colorCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: '#fff', borderWidth: 3 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontSize: 16 },
  saveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  saveBtnGradient: { padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});