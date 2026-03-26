import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS, SHADOWS } from "../utils/constants";

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  variant = "filled",
  style,
  disabled = false,
}) {
  const isGhost = variant === "ghost";
  const isOutline = variant === "outline";
  const buttonDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={buttonDisabled}
      style={({ pressed }) => [
        styles.base,
        isGhost && styles.ghost,
        isOutline && styles.outline,
        !isGhost && !isOutline && styles.filled,
        pressed && !buttonDisabled && styles.pressed,
        buttonDisabled && styles.disabled,
        style,
      ]}
    >
      {!isGhost && !isOutline ? (
        <LinearGradient
          colors={["#D96F37", "#B4481D", "#8F3512"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.text}>{title}</Text>
          )}
        </LinearGradient>
      ) : (
        <View style={styles.plainFill}>
          {loading ? (
            <ActivityIndicator
              color={isGhost || isOutline ? COLORS.primary : COLORS.white}
            />
          ) : (
            <Text
              style={[
                styles.text,
                isGhost && styles.ghostText,
                isOutline && styles.outlineText,
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
  },
  filled: {
    ...SHADOWS.medium,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  gradientFill: {
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  plainFill: {
    minHeight: 52,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    transform: [{ scale: 0.988 }],
  },
  disabled: {
    opacity: 0.62,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.15,
  },
  ghostText: {
    color: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
  },
});
