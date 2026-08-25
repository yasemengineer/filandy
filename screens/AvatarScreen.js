import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { avatarList } from '../data/avatarKits';
import ThemedBackground from '../components/ThemedBackground';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = (width - 60) / 3;

export default function AvatarScreen({ navigation }) {
  const [selectedId, setSelectedId] = useState(1);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const data = await AsyncStorage.getItem('psiko_avatar');
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.avatarId) setSelectedId(parsed.avatarId);
        }
      } catch (e) {}
    };
    loadAvatar();
  }, []);

  const saveAvatar = async () => {
    try {
      await AsyncStorage.setItem('psiko_avatar', JSON.stringify({ avatarId: selectedId }));
      navigation.goBack();
    } catch (e) {}
  };

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🧑‍⚕️ Terapistini Seç</Text>

        <View style={styles.previewBox}>
          <Image
            source={avatarList.find(a => a.id === selectedId)?.source}
            style={styles.previewImage}
            resizeMode="cover"
          />
          <Text style={styles.previewLabel}>Seçili Avatar #{selectedId}</Text>
        </View>

        <Text style={styles.sectionLabel}>Avatar Seç</Text>
        <View style={styles.grid}>
          {avatarList.map(avatar => (
            <TouchableOpacity
              key={avatar.id}
              style={[styles.avatarCard, selectedId === avatar.id && styles.avatarCardSelected]}
              onPress={() => setSelectedId(avatar.id)}
            >
              <Image source={avatar.source} style={styles.avatarThumb} resizeMode="cover" />
              {selectedId === avatar.id && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveAvatar}>
          <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.saveButtonGradient}>
            <Text style={styles.saveButtonText}>💾 Kaydet</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center', marginTop: 10 },
  previewBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  previewImage: { width: 140, height: 140, borderRadius: 70, marginBottom: 10, borderWidth: 3, borderColor: '#a855f7' },
  previewLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  avatarCard: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  avatarCardSelected: { borderColor: '#a855f7', borderWidth: 3 },
  avatarThumb: { width: '100%', height: '100%', borderRadius: AVATAR_SIZE / 2 },
  selectedBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#a855f7', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  selectedBadgeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  saveButton: { borderRadius: 16, overflow: 'hidden', elevation: 4 },
  saveButtonGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});