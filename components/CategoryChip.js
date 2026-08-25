import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CategoryChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
    >
      <Text style={styles.text} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,.1)",
    height: 36,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: "#9b59ff",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});