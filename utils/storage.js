import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES = "psiko_favorites";
const LIBRARY = "psiko_saved_books";

export async function getFavorites() {
  const data = await AsyncStorage.getItem(FAVORITES);
  return data ? JSON.parse(data) : [];
}

export async function saveFavorites(data) {
  await AsyncStorage.setItem(FAVORITES, JSON.stringify(data));
}

export async function getLibrary() {
  const data = await AsyncStorage.getItem(LIBRARY);
  return data ? JSON.parse(data) : [];
}

export async function saveLibrary(data) {
  await AsyncStorage.setItem(LIBRARY, JSON.stringify(data));
}