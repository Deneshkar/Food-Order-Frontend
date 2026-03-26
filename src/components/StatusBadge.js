import { StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "../utils/constants";

export default function StatusBadge({ label, color = COLORS.primary }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
});
