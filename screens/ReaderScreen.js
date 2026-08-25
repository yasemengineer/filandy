import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import ThemedBackground from "../components/ThemedBackground";

export default function ReaderScreen({ route, navigation }) {

  const { book } = route.params;

  const url =
    book.pdf ||
    book.epub ||
    book.previewLink ||
    book.infoLink;

  if (!url) {
    return (
      <ThemedBackground>
        <View style={styles.center}>
          <Text style={styles.title}>
            😔
          </Text>

          <Text style={styles.text}>
            Bu kitap için okunabilir içerik bulunamadı.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>
              Geri Dön
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedBackground>
    );
  }

  return (
    <WebView
      source={{ uri: url }}
      startInLoadingState
      javaScriptEnabled
      domStorageEnabled
    />
  );
}

const styles = StyleSheet.create({

  center:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    padding:25
  },

  title:{
    fontSize:50,
    marginBottom:15
  },

  text:{
    color:"#fff",
    fontSize:18,
    textAlign:"center",
    marginBottom:25
  },

  button:{
    backgroundColor:"#7c3aed",
    paddingHorizontal:25,
    paddingVertical:12,
    borderRadius:10
  },

  buttonText:{
    color:"#fff",
    fontWeight:"bold"
  }

});