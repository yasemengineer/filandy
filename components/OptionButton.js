import { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

export default function OptionButton({ label, onPress, state }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'correct') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 400, useNativeDriver: false }),
        ]),
        { iterations: 3 }
      ).start();
    } else if (state === 'wrong') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);


  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#28a745', '#5fffaa'],
  });

  const backgroundColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(40,167,69,0.2)', 'rgba(95,255,170,0.35)'],
  });

  const getStyle = () => {
    if (state === 'wrong') return styles.wrong;
    if (state === null) return styles.default;
    return null;
  };

  const getTextStyle = () => {
    if (state === 'correct') return styles.correctText;
    if (state === 'wrong') return styles.wrongText;
    return styles.defaultText;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateX: shakeAnim }] }}>
      {state === 'correct' ? (
        <Animated.View style={[styles.button, { backgroundColor, borderColor, borderWidth: 1.5 }]}>
          <TouchableOpacity disabled activeOpacity={1}>
            <Text style={[styles.text, getTextStyle()]}>{label}</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={[styles.button, getStyle()]}
          onPress={onPress}
          disabled={state !== null}
          activeOpacity={0.85}
        >
          <Text style={[styles.text, getTextStyle()]}>{label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1.5,
  },
  default: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  wrong: {
    backgroundColor: 'rgba(220,53,69,0.3)',
    borderColor: '#dc3545',
  },
  text: {
    fontSize: 15,
  },
  defaultText: {
    color: '#fff',
  },
  correctText: {
    color: '#5fffaa',
    fontWeight: '600',
  },
  wrongText: {
    color: '#ff8080',
    fontWeight: '600',
  },
});