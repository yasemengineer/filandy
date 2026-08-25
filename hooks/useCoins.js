import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useCoins() {
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    loadCoins();
  }, []);

  const loadCoins = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_coins');
      if (data) setCoins(parseInt(data));
    } catch (e) {}
  };

  const addCoins = async (amount) => {
    try {
      const data = await AsyncStorage.getItem('psiko_coins');
      const current = data ? parseInt(data) : 0;
      const newCoins = current + amount;
      await AsyncStorage.setItem('psiko_coins', newCoins.toString());
      setCoins(newCoins);
      return newCoins;
    } catch (e) {}
  };

  const spendCoins = async (amount) => {
    try {
      const data = await AsyncStorage.getItem('psiko_coins');
      const current = data ? parseInt(data) : 0;
      if (current < amount) return false;
      const newCoins = current - amount;
      await AsyncStorage.setItem('psiko_coins', newCoins.toString());
      setCoins(newCoins);
      return true;
    } catch (e) {
      return false;
    }
  };

  const clearCoins = async () => {
    await AsyncStorage.removeItem('psiko_coins');
    setCoins(0);
  };

  return { coins, addCoins, spendCoins, clearCoins, loadCoins };
}