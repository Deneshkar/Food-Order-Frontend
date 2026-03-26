import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "../utils/constants";

export default function ScreenContainer({
  children,
  scroll = true,
  contentContainerStyle,
  withGradient = false,
}) {
  const Wrapper = scroll ? ScrollView : View;
  const wrapperProps = scroll
    ? {
        contentContainerStyle: [styles.content, contentContainerStyle],
        showsVerticalScrollIndicator: false,
      }
    : {
        style: [styles.content, contentContainerStyle],
      };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      {withGradient ? (
        <LinearGradient
          colors={["#351609", "#8E3816", "#E49336"]}
          style={styles.gradient}
        />
      ) : null}
      <Wrapper {...wrapperProps}>{children}</Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  orbOne: {
    position: "absolute",
    top: 140,
    right: -90,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "rgba(242, 165, 65, 0.08)",
  },
  orbTwo: {
    position: "absolute",
    bottom: 140,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(34, 111, 84, 0.07)",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: 290,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 116,
  },
});
