import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { getCategories } from "../../api/categoryApi";
import { getMenuItems } from "../../api/menuApi";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import MenuCard from "../../components/MenuCard";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import { COLORS, FONTS } from "../../utils/constants";
import { extractErrorMessage } from "../../utils/helpers";

export default function MenuScreen({ navigation }) {
  const route = useRoute();
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    route.params?.selectedCategoryId || ""
  );
  const [search, setSearch] = useState(route.params?.search || "");
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (route.params?.selectedCategoryId) {
      setSelectedCategoryId(route.params.selectedCategoryId);
    }
  }, [route.params?.selectedCategoryId]);

  useEffect(() => {
    if (isFocused) {
      loadCategories();
      loadMenuItems();
    }
  }, [isFocused, selectedCategoryId]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load categories"));
    }
  };

  const loadMenuItems = async () => {
    try {
      setError("");
      const params = {};

      if (selectedCategoryId) {
        params.category = selectedCategoryId;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const data = await getMenuItems(params);
      setMenuItems(data.menuItems || []);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load menu items"));
    }
  };

  return (
    <ScreenContainer>
      <LinearGradient colors={["#FFF3DB", "#FFFDF8"]} style={styles.heroPanel}>
        <SectionTitle
          eyebrow="Browse Food"
          title="Menu"
          subtitle="Search, filter by category, and open any dish to view details."
        />
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>{menuItems.length}</Text>
            <Text style={styles.summaryLabel}>Visible Items</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryValue}>{categories.length}</Text>
            <Text style={styles.summaryLabel}>Categories</Text>
          </View>
        </View>
        <FormInput
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Search burgers, pizza, rice..."
        />

        <Pressable style={styles.searchButton} onPress={loadMenuItems}>
          <Text style={styles.searchButtonText}>Apply Search</Text>
        </Pressable>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          <Pressable
            style={[styles.chip, !selectedCategoryId && styles.activeChip]}
            onPress={() => setSelectedCategoryId("")}
          >
            <Text
              style={[
                styles.chipText,
                !selectedCategoryId && styles.activeChipText,
              ]}
            >
              All
            </Text>
          </Pressable>
          {categories.map((category) => {
            const active = selectedCategoryId === category._id;

            return (
              <Pressable
                key={category._id}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => setSelectedCategoryId(category._id)}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {error ? (
        <EmptyState title="Menu not available" description={error} />
      ) : menuItems.length ? (
        menuItems.map((item) => (
          <MenuCard
            key={item._id}
            item={item}
            onPress={() => navigation.navigate("MenuDetails", { itemId: item._id })}
          />
        ))
      ) : (
        <EmptyState
          title="No menu items found"
          description="Try another category or search keyword."
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    borderRadius: 28,
    padding: 18,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  summaryValue: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.text,
  },
  summaryLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  searchButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  searchButtonText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255, 253, 248, 0.92)",
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  activeChipText: {
    color: COLORS.white,
  },
});
