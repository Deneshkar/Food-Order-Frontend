import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS, DEFAULT_IMAGE, FONTS, SHADOWS } from "../utils/constants";
import { formatCurrency } from "../utils/helpers";
import StarRating from "./StarRating";

export default function MenuCard({ item, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Image
          source={{ uri: item?.image?.url || DEFAULT_IMAGE }}
          style={styles.image}
        />
        <LinearGradient
          colors={["transparent", "rgba(35, 20, 10, 0.68)"]}
          style={styles.imageFade}
        />
        <View style={styles.imageBadgeRow}>
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>
              {item?.category?.name || "Food item"}
            </Text>
          </View>
          <View
            style={[
              styles.availabilityBadge,
              !item?.isAvailable && styles.availabilityBadgeOff,
            ]}
          >
            <Text style={styles.availabilityText}>
              {item?.isAvailable ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name}>{item?.name}</Text>
          <Text style={styles.price}>{formatCurrency(item?.price)}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {item?.description || "Freshly prepared food item."}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.category}>
            Prep {item?.preparationTime || 20} min
          </Text>
          <StarRating rating={item?.averageRating || 0} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 14,
    ...SHADOWS.soft,
  },
  image: {
    width: "100%",
    height: 196,
  },
  imageFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  imageBadgeRow: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  imageBadge: {
    backgroundColor: "rgba(255, 253, 248, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  imageBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text,
  },
  availabilityBadge: {
    backgroundColor: "rgba(34, 111, 84, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  availabilityBadgeOff: {
    backgroundColor: "rgba(179, 38, 30, 0.92)",
  },
  availabilityText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  body: {
    padding: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.text,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.primary,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  category: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
