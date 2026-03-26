import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { getCategories } from "../../api/categoryApi";
import { getMenuItems } from "../../api/menuApi";
import EmptyState from "../../components/EmptyState";
import MenuCard from "../../components/MenuCard";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, FONTS } from "../../utils/constants";
import { extractErrorMessage } from "../../utils/helpers";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isFocused) {
      loadDashboardData();
    }
  }, [isFocused]);

  const loadDashboardData = async () => {
    try {
      setError("");
      const [categoryData, menuData] = await Promise.all([
        getCategories(),
        getMenuItems(),
      ]);

      setCategories(categoryData.categories || []);
      setFeaturedItems((menuData.menuItems || []).slice(0, 4));
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load home data"));
    }
  };

  return (
    <ScreenContainer withGradient>
      <LinearGradient colors={["#F8E3B5", "#FFFDF8"]} style={styles.heroCard}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0] || "Guest"}</Text>
        <Text style={styles.headline}>What would you like to eat today?</Text>
        <Text style={styles.subhead}>
          Browse fresh meals, filter by category, and place your order in a few taps.
        </Text>
        <View style={styles.metricRow}>
          <View style={styles.metricChip}>
            <Text style={styles.metricValue}>{categories.length}</Text>
            <Text style={styles.metricLabel}>Categories</Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricValue}>{featuredItems.length}</Text>
            <Text style={styles.metricLabel}>Fresh Picks</Text>
          </View>
          <View style={styles.metricChip}>
            <Text style={styles.metricValue}>Fast</Text>
            <Text style={styles.metricLabel}>Ordering</Text>
          </View>
        </View>
        <Pressable style={styles.heroButton} onPress={() => navigation.navigate("Menu")}>
          <Text style={styles.heroButtonText}>Explore the Menu</Text>
        </Pressable>
      </LinearGradient>

      <SectionTitle
        eyebrow="Quick Access"
        title="Categories"
        subtitle="Tap a category to jump straight into filtered menu items."
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryRow}>
          {categories.map((category, index) => {
            const palette = [
              ["#FFF3DB", "#FCE7B8"],
              ["#EAF6EF", "#D2EBDD"],
              ["#EAF1FA", "#D6E4F5"],
            ][index % 3];

            return (
              <LinearGradient
                key={category._id}
                colors={palette}
                style={styles.categoryCard}
              >
                <Pressable
                  onPress={() =>
                    navigation.navigate("Menu", {
                      selectedCategoryId: category._id,
                    })
                  }
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription} numberOfLines={2}>
                    {category.description || "Browse items in this category"}
                  </Text>
                </Pressable>
              </LinearGradient>
            );
          })}
        </View>
      </ScrollView>

      <SectionTitle
        eyebrow="Fresh Picks"
        title="Featured Menu"
        subtitle="Latest dishes from your backend menu collection."
      />

      {error ? (
        <EmptyState title="Unable to load data" description={error} />
      ) : featuredItems.length ? (
        featuredItems.map((item) => (
          <MenuCard
            key={item._id}
            item={item}
            onPress={() => navigation.navigate("MenuDetails", { itemId: item._id })}
          />
        ))
      ) : (
        <EmptyState
          title="No featured dishes yet"
          description="Create menu items from the admin side and they will appear here."
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 30,
    padding: 22,
    marginTop: 8,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    textTransform: "uppercase",
    color: COLORS.primaryDark,
    letterSpacing: 0.8,
  },
  headline: {
    fontFamily: FONTS.display,
    fontSize: 30,
    lineHeight: 36,
    color: COLORS.text,
    marginTop: 10,
  },
  subhead: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
    marginTop: 10,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  metricChip: {
    flex: 1,
    backgroundColor: "rgba(255, 253, 248, 0.85)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  metricValue: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.text,
  },
  metricLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  heroButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    backgroundColor: COLORS.text,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
  },
  heroButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.white,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 10,
  },
  categoryCard: {
    width: 180,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  categoryDescription: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});
