import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_TIERS = [
  { minXP: 0,     goal: 3,  bonus: 75  },
  { minXP: 500,   goal: 5,  bonus: 100 },
  { minXP: 1500,  goal: 7,  bonus: 150 },
  { minXP: 4000,  goal: 10, bonus: 200 },
  { minXP: 8000,  goal: 12, bonus: 300 },
  { minXP: 15000, goal: 15, bonus: 500 },
];

export function getDailyTier(xp) {
  let tier = DAILY_TIERS[0];
  for (const t of DAILY_TIERS) {
    if (xp >= t.minXP) tier = t;
  }
  return tier;
}

export function useDailyGoal() {
  const [todayCount, setTodayCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tier, setTier] = useState(DAILY_TIERS[0]);

  useEffect(() => {
    loadDaily();
  }, []);

  const loadDaily = async () => {
    try {
      const xpData = await AsyncStorage.getItem('psiko_xp');
      const xp = xpData ? parseInt(xpData) : 0;
      const currentTier = getDailyTier(xp);
      setTier(currentTier);

      const data = await AsyncStorage.getItem('psiko_daily');
      if (!data) return;
      const { date, count } = JSON.parse(data);
      const today = new Date().toDateString();
      if (date === today) {
        setTodayCount(count);
        setCompleted(count >= currentTier.goal);
      } else {
        await AsyncStorage.removeItem('psiko_daily');
      }
    } catch (e) {}
  };

  const addDailyProgress = async (correctCount) => {
    try {
      const xpData = await AsyncStorage.getItem('psiko_xp');
      const xp = xpData ? parseInt(xpData) : 0;
      const currentTier = getDailyTier(xp);

      const today = new Date().toDateString();
      const data = await AsyncStorage.getItem('psiko_daily');
      let current = { date: today, count: 0, bonusGiven: false };
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.date === today) current = parsed;
      }

      const newCount = current.count + correctCount;
      const wasCompleted = current.count >= currentTier.goal;
      const isNowCompleted = newCount >= currentTier.goal;
      const giveBonus = isNowCompleted && !wasCompleted && !current.bonusGiven;

      current.count = newCount;
      if (giveBonus) current.bonusGiven = true;

      await AsyncStorage.setItem('psiko_daily', JSON.stringify(current));
      setTodayCount(newCount);
      setCompleted(isNowCompleted);
      setTier(currentTier);

      return giveBonus ? currentTier.bonus : 0;
    } catch (e) {
      return 0;
    }
  };

  return { todayCount, completed, DAILY_GOAL: tier.goal, DAILY_BONUS: tier.bonus, addDailyProgress, loadDaily };
}