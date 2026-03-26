import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "../utils/constants";

export default function EmptyState({ title, description }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
    marginTop: 12,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
