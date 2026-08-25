import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

import ThemedBackground from "../components/ThemedBackground";
import SearchBar from "../components/SearchBar";
import CategoryChip from "../components/CategoryChip";
import BookCard from "../components/BookCard";

import { searchBooks } from "../services/googleBooks";

import {
  getFavorites,
  saveFavorites,
  getLibrary,
  saveLibrary
} from "../utils/storage";

const CATEGORIES = [
  { label: "Klinik Psikoloji", query: "clinical psychology" },
  { label: "Psikoterapi", query: "psychotherapy" },
  { label: "Gelişim Psikolojisi", query: "developmental psychology" },
  { label: "Sosyal Psikoloji", query: "social psychology" },
  { label: "Bilişsel Psikoloji", query: "cognitive psychology" },
  { label: "Nöropsikoloji", query: "neuropsychology" },
  { label: "Kişilik", query: "personality psychology" },
  { label: "Anormal Psikoloji", query: "abnormal psychology" },
  { label: "DSM-5", query: "DSM-5" },
  { label: "ICD-11", query: "ICD-11" },
  { label: "Psikolojik Değerlendirme", query: "psychological assessment" },
  { label: "Davranış Terapisi", query: "behavior therapy" },
];

export default function LibraryScreen({ navigation }) {

  const [books,setBooks]=useState([]);
  const [favorites,setFavorites]=useState([]);
  const [library,setLibrary]=useState([]);

  const [loading,setLoading]=useState(false);

  const [search,setSearch]=useState("");

  const [tab,setTab]=useState("discover");

  const [selectedCategory,setSelectedCategory]=useState("");

  useEffect(()=>{

    initialize();

  },[]);

  async function initialize(){

    const fav=await getFavorites();
    const lib=await getLibrary();

    setFavorites(fav);
    setLibrary(lib);

    loadBooks("psychology");

  }

  async function loadBooks(query){

    setLoading(true);

    const result=await searchBooks(query);

    setBooks(result);

    setLoading(false);

  }

  function isFavorite(id){

    return favorites.some(item=>item.id===id);

  }

  function isSaved(id){

    return library.some(item=>item.id===id);

  }

  async function toggleFavorite(book){

    let updated;

    if(isFavorite(book.id)){

      updated=favorites.filter(item=>item.id!==book.id);

    }else{

      updated=[...favorites,book];

    }

    setFavorites(updated);

    await saveFavorites(updated);

  }

  async function toggleLibrary(book){

    let updated;

    if(isSaved(book.id)){

      updated=library.filter(item=>item.id!==book.id);

    }else{

      updated=[...library,book];

    }

    setLibrary(updated);

    await saveLibrary(updated);

  }

  function renderBook(book){

    return(

      <BookCard

        key={book.id}

        book={book}

        favorite={isFavorite(book.id)}

        saved={isSaved(book.id)}

        onFavorite={()=>toggleFavorite(book)}

        onSave={()=>toggleLibrary(book)}

        onPress={()=>navigation.navigate("BookDetail",{book})}

      />

    );

  }

  return(

    <ThemedBackground>

      <View style={styles.container}>

        <Text style={styles.title}>
          📚 Kitaplık
        </Text>

        <View style={styles.tabs}>

          <TouchableOpacity
            style={[
              styles.tab,
              tab==="discover" && styles.activeTab
            ]}
            onPress={()=>setTab("discover")}
          >

            <Text style={styles.tabText}>
              Keşfet
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              tab==="library" && styles.activeTab
            ]}
            onPress={()=>setTab("library")}
          >

            <Text style={styles.tabText}>
              Kitaplığım ({library.length})
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              tab==="favorite" && styles.activeTab
            ]}
            onPress={()=>setTab("favorite")}
          >

            <Text style={styles.tabText}>
              Favoriler ({favorites.length})
            </Text>

          </TouchableOpacity>

        </View>

        {
          tab==="discover" && (
            <>

              <SearchBar

                value={search}

                onChange={setSearch}

                onSearch={()=>{

                  if(search.trim().length===0){

                    Alert.alert("Uyarı","Lütfen bir kitap adı gir.");

                    return;

                  }

                  loadBooks(search);

                }}

              />

              <View style={{flexShrink: 0}}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.map(cat=>(
                  <CategoryChip
                    key={cat.label}
                    label={cat.label}
                    selected={selectedCategory===cat.label}
                    onPress={()=>{
                      setSelectedCategory(cat.label);
                      loadBooks(cat.query);
                    }}
                  />
                ))}

              </ScrollView>
              </View>

              {
                loading ? (

                  <View style={styles.loading}>

                    <ActivityIndicator
                      color="#a855f7"
                      size="large"
                    />

                  </View>

                ) : (

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                  >

                    {books.map(renderBook)}

                  </ScrollView>

                )
              }

            </>
          )
        }
                {
          tab==="library" && (

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >

              {
                library.length===0 ?

                (

                  <View style={styles.empty}>

                    <Text style={styles.emptyEmoji}>
                      📚
                    </Text>

                    <Text style={styles.emptyText}>
                      Henüz kitap eklemedin.
                    </Text>

                  </View>

                )

                :

                library.map(renderBook)

              }

            </ScrollView>

          )
        }

        {
          tab==="favorite" && (

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            >

              {
                favorites.length===0 ?

                (

                  <View style={styles.empty}>

                    <Text style={styles.emptyEmoji}>
                      ❤️
                    </Text>

                    <Text style={styles.emptyText}>
                      Henüz favori kitabın yok.
                    </Text>

                  </View>

                )

                :

                favorites.map(renderBook)

              }

            </ScrollView>

          )
        }

      </View>

    </ThemedBackground>

  );

}

const styles=StyleSheet.create({

container:{
flex:1,
padding:18,
paddingTop:15
},

title:{
fontSize:28,
fontWeight:"bold",
color:"#fff",
marginBottom:15
},

tabs:{
flexDirection:"row",
marginBottom:15
},

tab:{
flex:1,
paddingVertical:10,
marginHorizontal:3,
backgroundColor:"rgba(255,255,255,.08)",
borderRadius:12,
alignItems:"center"
},

activeTab:{
backgroundColor:"#8b5cf6"
},

tabText:{
color:"#fff",
fontWeight:"700",
fontSize:12
},

categoryScroll:{
  marginBottom:15,
  maxHeight:50,
  flexGrow:0,
  flexShrink:0,
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center"
},

list:{
  paddingBottom:40,
  paddingTop:5,
},

empty:{
marginTop:80,
alignItems:"center"
},

emptyEmoji:{
fontSize:55
},

emptyText:{
marginTop:15,
fontSize:16,
color:"#fff"
}

});