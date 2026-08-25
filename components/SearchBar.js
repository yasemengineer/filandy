import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function SearchBar({
  value,
  onChange,
  onSearch
}) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Kitap veya yazar ara..."
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSearch}
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={onSearch}
      >
        <Text style={styles.icon}>🔍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({

container:{
flexDirection:"row",
marginBottom:15
},

input:{
flex:1,
backgroundColor:"rgba(255,255,255,.12)",
borderRadius:12,
padding:14,
color:"#fff"
},

button:{
marginLeft:8,
backgroundColor:"#9b59ff",
justifyContent:"center",
alignItems:"center",
paddingHorizontal:18,
borderRadius:12
},

icon:{
fontSize:22
}

});