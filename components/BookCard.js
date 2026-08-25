import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function BookCard({
  book,
  favorite,
  saved,
  onFavorite,
  onSave,
  onPress,
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>

      {book.thumbnail ? (
        <Image
          source={{ uri: book.thumbnail }}
          style={styles.image}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={{ fontSize: 34 }}>📖</Text>
        </View>
      )}

      <View style={styles.info}>

        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {book.title}
        </Text>

        <Text
          style={styles.author}
          numberOfLines={1}
        >
          {book.authors}
        </Text>

        {!!book.publisher && (
          <Text style={styles.publisher}>
            {book.publisher}
          </Text>
        )}

        <View style={styles.ratingRow}>

          <Text style={styles.rating}>
            ⭐ {book.averageRating || "-"}
          </Text>

          <Text style={styles.pages}>
            📄 {book.pageCount || "-"}
          </Text>

        </View>

        <View style={styles.buttons}>

          <TouchableOpacity
            style={[
              styles.smallButton,
              favorite && styles.favorite
            ]}
            onPress={onFavorite}
          >
            <Text style={styles.buttonText}>
              {favorite ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.smallButton,
              saved && styles.saved
            ]}
            onPress={onSave}
          >
            <Text style={styles.buttonText}>
              {saved ? "Kitaplıkta" : "+ Kitaplık"}
            </Text>
          </TouchableOpacity>

        </View>

      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({

card:{
flexDirection:"row",
backgroundColor:"rgba(255,255,255,.08)",
borderRadius:18,
padding:14,
marginBottom:14
},

image:{
width:80,
height:120,
borderRadius:10
},

placeholder:{
width:80,
height:120,
backgroundColor:"rgba(255,255,255,.1)",
borderRadius:10,
justifyContent:"center",
alignItems:"center"
},

info:{
flex:1,
marginLeft:14
},

title:{
fontSize:16,
fontWeight:"bold",
color:"#fff"
},

author:{
marginTop:5,
fontSize:13,
color:"#b980ff"
},

publisher:{
marginTop:4,
fontSize:12,
color:"#aaa"
},

ratingRow:{
flexDirection:"row",
marginTop:8
},

rating:{
color:"#fff",
marginRight:15
},

pages:{
color:"#fff"
},

buttons:{
flexDirection:"row",
marginTop:12
},

smallButton:{
paddingVertical:8,
paddingHorizontal:14,
borderRadius:10,
backgroundColor:"rgba(255,255,255,.12)",
marginRight:10
},

favorite:{
backgroundColor:"#d63384"
},

saved:{
backgroundColor:"#7c3aed"
},

buttonText:{
color:"#fff",
fontWeight:"600"
}

});