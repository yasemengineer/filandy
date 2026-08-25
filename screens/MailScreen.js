import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedBackground from '../components/ThemedBackground';

export default function MailScreen({ navigation }) {
  const openGmail = () => {
    Linking.openURL('mailto:').catch(() => {
      Alert.alert('Hata', 'Mail uygulaması açılamadı.');
    });
  };

  return (
    <ThemedBackground>
      <View style={styles.container}>
        <Text style={styles.title}>📧 Mailim</Text>

        <TouchableOpacity style={styles.gmailCard} onPress={openGmail}>
          <LinearGradient colors={['#ea4335', '#c5221f']} style={styles.gmailGradient}>
            <Text style={styles.gmailIcon}>✉️</Text>
            <Text style={styles.gmailTitle}>Gmail'i Aç</Text>
            <Text style={styles.gmailDesc}>Varsayılan mail uygulamanı aç</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messagesCard}
          onPress={() => navigation.navigate('Messages')}
        >
          <LinearGradient colors={['#6c5ce7', '#a855f7']} style={styles.gmailGradient}>
            <Text style={styles.gmailIcon}>💬</Text>
            <Text style={styles.gmailTitle}>Mesajlarım</Text>
            <Text style={styles.gmailDesc}>Uygulama içi mesajlaşma</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30, marginTop: 10 },
  gmailCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 16, elevation: 4 },
  messagesCard: { borderRadius: 20, overflow: 'hidden', elevation: 4 },
  gmailGradient: { padding: 24, alignItems: 'center' },
  gmailIcon: { fontSize: 48, marginBottom: 12 },
  gmailTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  gmailDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
});