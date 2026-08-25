import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotes } from '../hooks/useNotes';
import ThemedBackground from '../components/ThemedBackground';

const noteColors = ['#6c5ce7', '#0984e3', '#00b894', '#fdcb6e', '#e17055', '#fd79a8', '#a855f7', '#00cec9'];

export default function NotesScreen() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [selectedColor, setSelectedColor] = useState(noteColors[0]);
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [fontSize, setFontSize] = useState(15);

  const allTags = [...new Set(notes.map(n => n.tag).filter(Boolean))];
  const filteredNotes = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchText.toLowerCase()) || n.content.toLowerCase().includes(searchText.toLowerCase());
    const matchTag = selectedTag ? n.tag === selectedTag : true;
    return matchSearch && matchTag;
  });

  const openAdd = () => {
    setEditingNote(null); setTitle(''); setContent(''); setTag(''); setSelectedColor(noteColors[0]); setShowModal(true);
  };

  const openEdit = (note) => {
    setEditingNote(note); setTitle(note.title); setContent(note.content); setTag(note.tag || ''); setSelectedColor(note.color || noteColors[0]); setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert('Uyarı', 'Başlık boş olamaz!');
    if (editingNote) await updateNote(editingNote.id, title, content, tag, selectedColor);
    else await addNote(title, content, tag, selectedColor);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Notu Sil', 'Bu notu silmek istediğinden emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => deleteNote(id) },
    ]);
  };

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📝 Not Defterim</Text>
          <View style={styles.fontControls}>
            <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize(f => Math.max(12, f - 1))}>
              <Text style={styles.fontBtnText}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize(f => Math.min(22, f + 1))}>
              <Text style={styles.fontBtnText}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput style={styles.searchInput} placeholder="Not ara..." placeholderTextColor="rgba(255,255,255,0.4)" value={searchText} onChangeText={setSearchText} />

        {allTags.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
            <TouchableOpacity style={[styles.tagChip, !selectedTag && styles.tagChipSelected]} onPress={() => setSelectedTag(null)}>
              <Text style={styles.tagChipText}>Tümü</Text>
            </TouchableOpacity>
            {allTags.map(t => (
              <TouchableOpacity key={t} style={[styles.tagChip, selectedTag === t && styles.tagChipSelected]} onPress={() => setSelectedTag(selectedTag === t ? null : t)}>
                <Text style={styles.tagChipText}>#{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {filteredNotes.length === 0 && <View style={styles.emptyBox}><Text style={styles.emptyText}>Henüz not yok. İlk notunu ekle!</Text></View>}

        {filteredNotes.map(note => (
          <TouchableOpacity key={note.id} style={[styles.noteCard, { borderLeftColor: note.color }]} onPress={() => openEdit(note)}>
            <View style={styles.noteHeader}>
              <Text style={[styles.noteTitle, { fontSize }]}>{note.title}</Text>
              <TouchableOpacity onPress={() => handleDelete(note.id)}>
                <Text style={styles.deleteBtn}>🗑️</Text>
              </TouchableOpacity>
            </View>
            {note.tag && <Text style={[styles.noteTag, { color: note.color }]}>#{note.tag}</Text>}
            <Text style={[styles.noteContent, { fontSize: fontSize - 2 }]} numberOfLines={3}>{note.content}</Text>
            <Text style={styles.noteDate}>{note.updatedAt || note.createdAt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingNote ? 'Notu Düzenle' : 'Yeni Not'}</Text>
            <TextInput style={styles.modalInput} placeholder="Başlık" placeholderTextColor="#aaa" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.modalInput, styles.modalTextArea]} placeholder="Notunu buraya yaz..." placeholderTextColor="#aaa" value={content} onChangeText={setContent} multiline numberOfLines={8} textAlignVertical="top" />
            <TextInput style={styles.modalInput} placeholder="Etiket (örn: depresyon, anksiyete)" placeholderTextColor="#aaa" value={tag} onChangeText={setTag} />
            <Text style={styles.colorLabel}>Not Rengi:</Text>
            <View style={styles.colorRow}>
              {noteColors.map(c => (
                <TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && styles.colorSelected]} onPress={() => setSelectedColor(c)} />
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
  container: { padding: 20, flexGrow: 1, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  fontControls: { flexDirection: 'row', gap: 8 },
  fontBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  fontBtnText: { color: '#fff', fontWeight: 'bold' },
  searchInput: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  tagScroll: { marginBottom: 12, maxHeight: 40 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginRight: 8, backgroundColor: 'rgba(255,255,255,0.1)', height: 32, justifyContent: 'center' },
  tagChipSelected: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  tagChipText: { color: '#fff', fontSize: 12 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  noteCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  noteTitle: { fontWeight: 'bold', color: '#fff', flex: 1 },
  deleteBtn: { fontSize: 18 },
  noteTag: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  noteContent: { color: 'rgba(255,255,255,0.75)', lineHeight: 20, marginBottom: 8 },
  noteDate: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'right' },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1e1e5e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  modalTextArea: { height: 160 },
  colorLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 10 },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  colorCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: '#fff', borderWidth: 3 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontSize: 16 },
  saveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  saveBtnGradient: { padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});