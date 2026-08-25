import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const achievementList = [
  {
    id: 'first_correct',
    title: 'İlk Adım',
    description: 'İlk soruyu doğru yanıtla',
    icon: '🎯',
  },
  {
    id: 'streak_3',
    title: 'Ateşli Başlangıç',
    description: '3 üst üste doğru cevap ver',
    icon: '🔥',
  },
  {
    id: 'streak_5',
    title: 'Durdurulamaz',
    description: '5 üst üste doğru cevap ver',
    icon: '⚡',
  },
  {
    id: 'perfect_round',
    title: 'Mükemmeliyetçi',
    description: 'Bir turda tüm soruları doğru yap',
    icon: '💯',
  },
  {
    id: 'xp_500',
    title: 'Yükselen Yıldız',
    description: '500 XP kazan',
    icon: '⭐',
  },
  {
    id: 'xp_1500',
    title: 'Uzman',
    description: '1500 XP kazan',
    icon: '🏆',
  },
  {
    id: 'xp_4000',
    title: 'Efsane',
    description: '4000 XP kazan',
    icon: '👑',
  },
  {
    id: 'unit_perfect',
    title: 'Konuya Hakim',
    description: 'Bir ünitede %100 al',
    icon: '📚',
  },
  {
    id: 'three_units',
    title: 'Çok Yönlü',
    description: '3 farklı ünitede soru çöz',
    icon: '🎓',
  },
  {
    id: 'all_units',
    title: 'Tam Kapsamlı',
    description: 'Tüm ünitelerde soru çöz',
    icon: '🌟',
  },
];

export async function unlockAchievement(id) {
  try {
    const data = await AsyncStorage.getItem('psiko_achievements');
    const current = data ? JSON.parse(data) : [];
    if (current.includes(id)) return null;
    current.push(id);
    await AsyncStorage.setItem('psiko_achievements', JSON.stringify(current));
    return achievementList.find(a => a.id === id);
  } catch (e) {
    return null;
  }
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await AsyncStorage.getItem('psiko_achievements');
      if (data) setUnlocked(JSON.parse(data));
    } catch (e) {}
  };

  const clearAchievements = async () => {
    await AsyncStorage.removeItem('psiko_achievements');
    setUnlocked([]);
  };

  return { unlocked, clearAchievements };
}