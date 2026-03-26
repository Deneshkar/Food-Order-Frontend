import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "../utils/constants";

export default function StarRating({
  rating = 0,
  size = "small",
  selectable = false,
  onChange,
}) {
  const stars = [1, 2, 3, 4, 5];
  const fontSize = size === "large" ? 26 : 18;

  return (
    <View style={styles.row}>
      {stars.map((star) => {
        const active = star <= rating;
        const Wrapper = selectable ? Pressable : View;

        return (
          <Wrapper
            key={star}
            onPress={selectable ? () => onChange?.(star) : undefined}
          >
            <Text
              style={[
                styles.star,
                { fontSize, color: active ? COLORS.accent : COLORS.border },
              ]}
            >
              ★
            </Text>
          </Wrapper>
        );
      })}
      <Text style={styles.label}>{rating ? `${rating}/5` : "No rating yet"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  star: {
    fontFamily: FONTS.bold,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
});
