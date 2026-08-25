import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStats() {
  const [stats, setStats] = useState({});
  const [levels, setLevels] = useState({});

  useEffect(() => {
    loadStats();
    loadLevels();
  }, []);

  const loadStats = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_stats');
      if (data) setStats(JSON.parse(data));
    } catch (e) {}
  };

  const loadLevels = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_levels');
      if (data) setLevels(JSON.parse(data));
    } catch (e) {}
  };

  const saveResult = async (wrongAnswers, correctAnswers) => {
    try {
      const data = await AsyncStorage.getItem('psiko_stats');
      const current = data ? JSON.parse(data) : {};

      correctAnswers.forEach(unit => {
        if (!current[unit]) current[unit] = { correct: 0, wrong: 0 };
        current[unit].correct += 1;
      });

      wrongAnswers.forEach(({ unit }) => {
        if (!current[unit]) current[unit] = { correct: 0, wrong: 0 };
        current[unit].wrong += 1;
      });

      await AsyncStorage.setItem('psiko_stats', JSON.stringify(current));
      setStats(current);
    } catch (e) {}
  };

  const updateLevel = async (unitId, score, total) => {
    try {
      const data = await AsyncStorage.getItem('psiko_levels');
      const current = data ? JSON.parse(data) : {};
      if (!current[unitId]) current[unitId] = { level: 1, unvan: 'Stajyer Terapist' };

      const percentage = Math.round((score / total) * 100);
      const currentLevel = current[unitId].level;

      if (percentage >= 70 && currentLevel < 5) {
        const newLevel = currentLevel + 1;
        const unvanMap = {
          1: 'Başlangıç',
          2: 'Gelişiyor',
          3: 'Yetkin',
          4: 'İleri Düzey',
          5: 'Uzman',
        };
        current[unitId] = { level: newLevel, unvan: unvanMap[newLevel] };
        await AsyncStorage.setItem('psiko_levels', JSON.stringify(current));
        setLevels(current);
        return { leveledUp: true, newLevel, unvan: unvanMap[newLevel] };
      }

      await AsyncStorage.setItem('psiko_levels', JSON.stringify(current));
      setLevels(current);
      return { leveledUp: false };
    } catch (e) {
      return { leveledUp: false };
    }
  };

  const clearStats = async () => {
    await AsyncStorage.removeItem('psiko_stats');
    await AsyncStorage.removeItem('psiko_levels');
    setStats({});
    setLevels({});
  };

  return { stats, levels, saveResult, updateLevel, clearStats };
}