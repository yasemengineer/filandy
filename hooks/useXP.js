import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const careerLevels = [
  { title: 'Öğrenci', minXP: 0 },
  { title: 'Stajyer Öğrenci', minXP: 500 },
  { title: 'Stajyer Psikolog', minXP: 1500 },
  { title: 'Psikolog', minXP: 4000 },
  { title: 'Klinik Psikolog', minXP: 8000 },
  { title: 'Dr. Klinik Psikolog', minXP: 15000 },
  { title: 'Doç. Klinik Psikolog', minXP: 25000 },
  { title: 'Prof. Klinik Psikolog', minXP: 40000 },
];

export function getCareerInfo(xp) {
  let current = careerLevels[0];
  let next = careerLevels[1];
  for (let i = 0; i < careerLevels.length; i++) {
    if (xp >= careerLevels[i].minXP) {
      current = careerLevels[i];
      next = careerLevels[i + 1] || null;
    }
  }
  return { current, next };
}

export function useXP() {
  const [xp, setXP] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadXP();
  }, []);

  const loadXP = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_xp');
      if (data) setXP(parseInt(data));
    } catch (e) {}
  };

  const addXP = async (correct, newStreak) => {
    if (!correct) {
      setStreak(0);
      return { xpGained: 0, newStreak: 0, bonusXP: 0 };
    }

    let xpGained = 50;
    let bonusXP = 0;

    if (newStreak >= 5) {
      bonusXP = 100;
    } else if (newStreak >= 3) {
      bonusXP = 50;
    }

    xpGained += bonusXP;

    try {
      const data = await AsyncStorage.getItem('psiko_xp');
      const currentXP = data ? parseInt(data) : 0;
      const newXP = currentXP + xpGained;
      await AsyncStorage.setItem('psiko_xp', newXP.toString());
      setXP(newXP);
    } catch (e) {}

    return { xpGained, newStreak, bonusXP };
  };

  const clearXP = async () => {
    await AsyncStorage.removeItem('psiko_xp');
    setXP(0);
    setStreak(0);
  };

  return { xp, streak, setStreak, addXP, clearXP };
}