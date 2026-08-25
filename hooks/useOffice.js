import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useOffice() {
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [officeTheme, setOfficeTheme] = useState('default');

  useEffect(() => {
    loadOffice();
  }, []);

  const loadOffice = async () => {
    try {
      const items = await AsyncStorage.getItem('psiko_office_items');
      const theme = await AsyncStorage.getItem('psiko_office_theme');
      if (items) setPurchasedItems(JSON.parse(items));
      if (theme) setOfficeTheme(theme);
    } catch (e) {}
  };

  const purchaseItem = async (itemId) => {
    try {
      const newItems = [...purchasedItems, itemId];
      await AsyncStorage.setItem('psiko_office_items', JSON.stringify(newItems));
      setPurchasedItems(newItems);
    } catch (e) {}
  };

  const changeTheme = async (theme) => {
    try {
      await AsyncStorage.setItem('psiko_office_theme', theme);
      setOfficeTheme(theme);
    } catch (e) {}
  };

  const isOwned = (itemId) => purchasedItems.includes(itemId);

  return { purchasedItems, officeTheme, purchaseItem, changeTheme, isOwned, loadOffice };
} 