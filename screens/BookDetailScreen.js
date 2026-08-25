import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import ThemedBackground from "../components/ThemedBackground";

export default function BookDetailScreen({ route, navigation }) {
  const { book } = route.params;

  const getLanguage = (lang) => {
    if (!lang) return 'Belirtilmemiş';
    if (lang === 'tr') return 'Türkçe';
    if (lang === 'en') return 'İngilizce';
    if (lang === 'de') return 'Almanca';
    if (lang === 'fr') return 'Fransızca';
    return lang;
  };

  return (
    <ThemedBackground>
      <ScrollView contentContainerStyle={styles.container}>
        {(book.largeThumbnail || book.thumbnail) ? (
          <Image source={{ uri: book.largeThumbnail || book.thumbnail }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={{ fontSize: 60 }}>📖</Text>
          </View>
        )}

        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.authors}</Text>

        <View style={styles.infoBox}>
          {!!book.publisher && book.publisher !== 'Bilinmiyor' && (
            <Text style={styles.info}>📚 Yayıncı: {book.publisher}</Text>
          )}
          {!!book.publishedDate && (
            <Text style={styles.info}>📅 Yayın Yılı: {book.publishedDate}</Text>
          )}
          {!!book.pageCount && book.pageCount > 0 && (
            <Text style={styles.info}>📄 {book.pageCount} Sayfa</Text>
          )}
          {!!book.averageRating && book.averageRating > 0 && (
            <Text style={styles.info}>⭐ {book.averageRating} / 5</Text>
          )}
        </View>

        {!!book.description && (
          <Text style={styles.description}>{book.description}</Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Reader", { book })}
        >
          <Text style={styles.buttonText}>📖 Kitabı Oku</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  cover: { width: 180, height: 270, alignSelf: "center", borderRadius: 12 },
  coverPlaceholder: { width: 180, height: 270, alignSelf: "center", borderRadius: 12, backgroundColor: 'rgba(168,85,247,0.2)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 20, color: "#fff", lineHeight: 30 },
  author: { fontSize: 15, marginTop: 8, color: "#c084fc" },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, marginTop: 16, marginBottom: 8 },
  info: { color: "#ddd", fontSize: 14, marginBottom: 6 },
  description: { marginTop: 12, lineHeight: 24, color: "rgba(255,255,255,0.8)", fontSize: 14 },
  button: { marginTop: 30, backgroundColor: "#7c3aed", padding: 16, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});