import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedBackground from '../components/ThemedBackground';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState([{ id: '1', name: 'Asude', avatar: '👩‍🎓' }]);
  const [selectedContact, setSelectedContact] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { loadContacts(); }, []);
  useEffect(() => { if (selectedContact) loadMessages(selectedContact.id); }, [selectedContact]);

  const loadContacts = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_contacts');
      if (data) setContacts(JSON.parse(data));
    } catch (e) {}
  };

  const loadMessages = async (contactId) => {
    try {
      const data = await AsyncStorage.getItem(`psiko_messages_${contactId}`);
      if (data) setMessages(JSON.parse(data));
      else setMessages([]);
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedContact) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      sent: true,
    };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    setInput('');
    await AsyncStorage.setItem(`psiko_messages_${selectedContact.id}`, JSON.stringify(newMessages));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addContact = async () => {
    const newContact = { id: Date.now().toString(), name: `Kişi ${contacts.length + 1}`, avatar: '👤' };
    const newContacts = [...contacts, newContact];
    setContacts(newContacts);
    await AsyncStorage.setItem('psiko_contacts', JSON.stringify(newContacts));
  };

  if (!selectedContact) {
    return (
      <ThemedBackground>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.title}>💬 Mesajlarım</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addContact}>
              <Text style={styles.addBtnText}>+ Kişi</Text>
            </TouchableOpacity>
          </View>
          {contacts.map(contact => (
            <TouchableOpacity key={contact.id} style={styles.contactCard} onPress={() => setSelectedContact(contact)}>
              <Text style={styles.contactAvatar}>{contact.avatar}</Text>
              <Text style={styles.contactName}>{contact.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedBackground>
    );
  }

  return (
    <ThemedBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedContact(null)}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.chatTitle}>{selectedContact.avatar} {selectedContact.name}</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.length === 0 && (
            <Text style={styles.noMessages}>Henüz mesaj yok. İlk mesajı gönder!</Text>
          )}
          {messages.map(msg => (
            <View key={msg.id} style={[styles.messageBubble, msg.sent ? styles.sentBubble : styles.receivedBubble]}>
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.messageInput}
            placeholder="Mesaj yaz..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={input}
            onChangeText={setInput}
            multiline
            maxHeight={100}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#a855f7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  contactAvatar: { fontSize: 32, marginRight: 14 },
  contactName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16, backgroundColor: 'rgba(0,0,0,0.2)' },
  backBtn: { color: '#a855f7', fontSize: 16, fontWeight: '600' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  chatContainer: { padding: 16, flexGrow: 1 },
  noMessages: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 40 },
  messageBubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 8 },
  sentBubble: { backgroundColor: '#a855f7', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  receivedBubble: { backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { color: '#fff', fontSize: 15, lineHeight: 20 },
  messageTime: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4, textAlign: 'right' },
  inputRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, gap: 10, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'flex-end' },
  messageInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sendBtn: { backgroundColor: '#a855f7', borderRadius: 20, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  sendBtnText: { color: '#fff', fontSize: 18 },
});