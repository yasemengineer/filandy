import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../data/themes';

let listeners = [];

export function useTheme() {
  const [themeId, setThemeId] = useState('default');

  useEffect(() => {
    loadTheme();
    listeners.push(setThemeId);
    return () => {
      listeners = listeners.filter(l => l !== setThemeId);
    };
  }, []);

  const loadTheme = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_theme');
      if (data) setThemeId(data);
    } catch (e) {}
  };

  const changeTheme = async (id) => {
    try {
      await AsyncStorage.setItem('psiko_theme', id);
      listeners.forEach(l => l(id));
    } catch (e) {}
  };

  const currentTheme = themes.find(t => t.id === themeId) || themes[0];

  return { themeId, currentTheme, changeTheme };
}