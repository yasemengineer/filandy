import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { themes } from '../data/themes';
import ThemedBackground from '../components/ThemedBackground';
import { useCoins } from '../hooks/useCoins';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const officeButtons = [
  { id: 'calendar', icon: null, name: 'Takvim', screen: 'Calendar', isDate: true },
  { id: 'appointments', icon: '📋', name: 'Randevularım', screen: 'Appointments' },
  { id: 'library', icon: '📚', name: 'Kitaplık', screen: 'Library' },
  { id: 'surveys', icon: '📊', name: 'Anketlerim', screen: 'Surveys' },
  { id: 'mail', icon: '📧', name: 'Mailim', screen: 'Mail' },
  { id: 'messages', icon: '💬', name: 'Mesajlarım', screen: 'Messages' },
  { id: 'calculator', icon: '🧮', name: 'Hesap Makinesi', screen: 'Calculator' },
  { id: 'puzzle', icon: '🧩', name: 'Puzzle', screen: 'Puzzle' },
];

export default function OfficeScreen({ navigation }) {
  const { themeId, currentTheme, changeTheme } = useTheme();
  const { coins, loadCoins } = useCoins();  const [activeTab, setActiveTab] = useState('office');
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    const loadXP = async () => {
      const data = await AsyncStorage.getItem('psiko_xp');
      if (data) setTotalXP(parseInt(data));
    };
    loadXP();
    loadCoins();
  }, []);

  const renderThemeItem = (theme) => {
    const isActive = themeId === theme.id;
    return (
      <TouchableOpacity
        key={theme.id}
        style={[styles.themeCard, isActive && styles.themeCardActive]}
        onPress={() => changeTheme(theme.id)}
      >
        {theme.type === 'image' ? (
          <Image source={theme.source} style={styles.themePreviewImage} resizeMode="cover" />
        ) : (
          <LinearGradient colors={theme.colors} style={styles.themePreviewGradient} />
        )}
        <Text style={styles.themeName}>{theme.name}</Text>
        {isActive && <Text style={styles.themeActive}>✅</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedBackground style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏢 Ofisim</Text>
          <View style={styles.coinBadge}>
            <Text style={styles.coinText}>🪙 {coins}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'office' && styles.tabActive]}
            onPress={() => setActiveTab('office')}
          >
            <Text style={styles.tabText}>🏢 Ofis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'theme' && styles.tabActive]}
            onPress={() => setActiveTab('theme')}
          >
            <Text style={styles.tabText}>🎨 Tema</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'office' && (
          <>
            <Text style={styles.sectionTitle}>Ofis Araçları</Text>
            <View style={styles.officeGrid}>
                    {officeButtons.map(btn => {
        const now = new Date();
        const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts'];
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

        return (
            <TouchableOpacity
            key={btn.id}
            style={styles.officeBtn}
            onPress={() => navigation.navigate(btn.screen)}
            >
            {btn.isDate ? (
              <View style={styles.dateSplit}>
                <View style={styles.dateSplitLeft}>
                  <Text style={styles.dateIcon}>📅</Text>
                  <Text style={styles.dateSplitLabel}>Takvim</Text>
                </View>
                <View style={styles.dateSplitDivider} />
                <View style={styles.dateSplitRight}>
                  <Text style={styles.dateDay}>{days[now.getDay()]}</Text>
                  <Text style={styles.dateNum}>{now.getDate()}</Text>
                  <Text style={styles.dateMon}>{months[now.getMonth()]}</Text>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.officeBtnIcon}>{btn.icon}</Text>
                <Text style={styles.officeBtnName}>{btn.name}</Text>
              </>
            )}
            </TouchableOpacity>
        );
        })}
            </View>
          </>
        )}

        {activeTab === 'theme' && (
          <>
            <Text style={styles.sectionTitle}>Gradient Temalar</Text>
            <View style={styles.themesGrid}>
              {themes.filter(t => t.type === 'gradient').map(renderThemeItem)}
            </View>

            <Text style={styles.sectionTitle}>Fotoğraf Temalar</Text>
            <View style={styles.themesGrid}>
              {themes.filter(t => t.type === 'image').map(renderThemeItem)}
            </View>
          </>
        )}
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  coinBadge: { backgroundColor: 'rgba(253,203,110,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#fdcb6e' },
  coinText: { color: '#fdcb6e', fontWeight: 'bold', fontSize: 16 },
  tabs: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  tabActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  tabText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12, marginTop: 4 },
  officeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  officeBtn: { width: (width - 56) / 2, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  officeBtnIcon: { fontSize: 44, marginBottom: 10 },
  officeBtnName: { color: '#fff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  themesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  themeCard: { width: (width - 60) / 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  themeCardActive: { borderColor: '#a855f7', borderWidth: 2 },
  themePreviewImage: { width: '100%', height: 80 },
  themePreviewGradient: { width: '100%', height: 80 },
  themeName: { color: '#fff', fontSize: 13, fontWeight: '600', padding: 10, paddingBottom: 4 },
  themeActive: { paddingHorizontal: 10, paddingBottom: 8, fontSize: 13 },
  dateBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  dateSplit: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  dateSplitLeft: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dateIcon: { fontSize: 28, marginBottom: 4 },
  dateSplitLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  dateSplitDivider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  dateSplitRight: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontSize: 13, color: '#fff', fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  dateNum: { fontSize: 30, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  dateMon: { fontSize: 13, color: '#fff', fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});