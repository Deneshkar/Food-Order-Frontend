import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

import { getCategories } from "../../api/categoryApi";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from "../../api/menuApi";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import StatusBadge from "../../components/StatusBadge";
import {
  COLORS,
  DEFAULT_IMAGE,
  FONTS,
  SHADOWS,
} from "../../utils/constants";
import { extractErrorMessage, formatCurrency } from "../../utils/helpers";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  ingredients: "",
  quantity: "0",
  preparationTime: "20",
  isAvailable: true,
};

export default function ManageMenuScreen() {
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      setError("");
      const [categoryData, menuData] = await Promise.all([
        getCategories(),
        getMenuItems(),
      ]);

      setCategories(categoryData.categories || []);
      setMenuItems(menuData.menuItems || []);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load menu data"));
    }
  };

  const availableCount = useMemo(
    () => menuItems.filter((item) => item.isAvailable).length,
    [menuItems]
  );

  const totalStock = useMemo(
    () =>
      menuItems.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      ),
    [menuItems]
  );

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
    setSelectedImage(null);
    setExistingImageUrl("");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      const numericQuantity = Number(form.quantity);

      if (Number.isNaN(numericQuantity) || numericQuantity < 0) {
        Alert.alert("Validation", "Quantity must be a valid non-negative number");
        return;
      }

      setSaving(true);

      const payload = {
        ...form,
        quantity: String(numericQuantity),
        image: selectedImage,
      };

      if (editingId) {
        await updateMenuItem(editingId, payload);
        Alert.alert("Updated", "Menu item updated successfully");
      } else {
        await createMenuItem(payload);
        Alert.alert("Created", "Menu item created successfully");
      }

      resetForm();
      await loadData();
    } catch (error) {
      Alert.alert("Menu Error", extractErrorMessage(error, "Failed to save menu item"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setSelectedImage(null);
    setExistingImageUrl(item.image?.url || "");
    setForm({
      name: item.name || "",
      description: item.description || "",
      price: String(item.price || ""),
      category: item.category?._id || "",
      ingredients: (item.ingredients || []).join(", "),
      quantity: String(item.quantity ?? 0),
      preparationTime: String(item.preparationTime || 20),
      isAvailable: item.isAvailable,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      await loadData();
    } catch (error) {
      Alert.alert("Delete Error", extractErrorMessage(error, "Failed to delete menu item"));
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AnimatedEntrance trigger={isFocused}>
        <SectionTitle
          eyebrow="Admin"
          title="Menu Management"
          subtitle="Create dishes, update pricing, stock quantity, and control availability."
        />
      </AnimatedEntrance>

      <AnimatedEntrance delay={60} trigger={isFocused} style={styles.heroCard}>
        <LinearGradient
          colors={["#2D1107", "#7F3315", "#D17D2A"]}
          style={styles.heroGradient}
        >
          <Text style={styles.heroEyebrow}>Kitchen Control</Text>
          <Text style={styles.heroTitle}>Shape the menu before customers see it.</Text>

          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{menuItems.length}</Text>
              <Text style={styles.heroMetricLabel}>Total Dishes</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{categories.length}</Text>
              <Text style={styles.heroMetricLabel}>Categories</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{availableCount}</Text>
              <Text style={styles.heroMetricLabel}>Available</Text>
            </View>
          </View>

          <View style={styles.stockSummary}>
            <Text style={styles.stockSummaryLabel}>Total Stock</Text>
            <Text style={styles.stockSummaryValue}>{totalStock} items</Text>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      <AnimatedEntrance delay={110} trigger={isFocused} style={styles.formCard}>
        <View style={styles.formHeader}>
          <View>
            <Text style={styles.formEyebrow}>
              {editingId ? "Editing Existing Dish" : "Create New Dish"}
            </Text>
            <Text style={styles.formTitle}>
              {editingId ? "Update menu item" : "Add a fresh menu entry"}
            </Text>
          </View>
          <StatusBadge
            label={form.isAvailable ? "Visible" : "Hidden"}
            color={form.isAvailable ? COLORS.success : COLORS.danger}
          />
        </View>

        <Image
          source={{ uri: selectedImage?.uri || existingImageUrl || DEFAULT_IMAGE }}
          style={styles.previewImage}
        />
        <PrimaryButton title="Choose Food Image" variant="outline" onPress={pickImage} />

        <FormInput
          label="Item Name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
          placeholder="Chicken Burger"
        />
        <FormInput
          label="Description"
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
          placeholder="Short description"
          multiline
        />

        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Price"
              value={form.price}
              onChangeText={(value) => updateField("price", value)}
              placeholder="1200"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput
              label="Preparation Time"
              value={form.preparationTime}
              onChangeText={(value) => updateField("preparationTime", value)}
              placeholder="15"
              keyboardType="numeric"
            />
          </View>
        </View>

        <FormInput
          label="Quantity"
          value={form.quantity}
          onChangeText={(value) => updateField("quantity", value)}
          placeholder="10"
          keyboardType="numeric"
        />

        <FormInput
          label="Ingredients"
          value={form.ingredients}
          onChangeText={(value) => updateField("ingredients", value)}
          placeholder="bun, chicken, cheese"
        />

        <Text style={styles.label}>Select Category</Text>
        <View style={styles.chipRow}>
          {categories.map((category) => {
            const active = form.category === category._id;

            return (
              <Pressable
                key={category._id}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => updateField("category", category._id)}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!categories.length ? (
          <Text style={styles.inlineHint}>
            Create at least one category before adding menu items.
          </Text>
        ) : null}

        <Pressable
          style={[styles.toggleButton, form.isAvailable && styles.toggleButtonActive]}
          onPress={() => updateField("isAvailable", !form.isAvailable)}
        >
          <Text
            style={[styles.toggleText, form.isAvailable && styles.toggleTextActive]}
          >
            {form.isAvailable ? "Item is Available" : "Item is Unavailable"}
          </Text>
        </Pressable>

        <PrimaryButton
          title={editingId ? "Update Menu Item" : "Create Menu Item"}
          onPress={handleSubmit}
          loading={saving}
        />
        {editingId ? (
          <PrimaryButton title="Cancel Edit" variant="outline" onPress={resetForm} />
        ) : null}
      </AnimatedEntrance>

      {error ? (
        <AnimatedEntrance delay={150} trigger={isFocused}>
          <EmptyState title="Cannot load menu items" description={error} />
        </AnimatedEntrance>
      ) : menuItems.length ? (
        menuItems.map((item, index) => (
          <AnimatedEntrance
            key={item._id}
            delay={170 + index * 40}
            trigger={isFocused}
            style={styles.menuCard}
          >
            <Image
              source={{ uri: item.image?.url || DEFAULT_IMAGE }}
              style={styles.menuImage}
            />

            <View style={styles.menuHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuMeta}>{item.category?.name || "Uncategorized"}</Text>
              </View>
              <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
            </View>

            <View style={styles.badgeStrip}>
              <StatusBadge
                label={item.isAvailable ? "Available" : "Unavailable"}
                color={item.isAvailable ? COLORS.success : COLORS.danger}
              />
              <StatusBadge
                label={`${item.preparationTime} min`}
                color={COLORS.tertiary}
              />
              <StatusBadge
                label={`Stock: ${item.quantity ?? 0}`}
                color={(item.quantity ?? 0) > 0 ? COLORS.info : COLORS.warning}
              />
            </View>

            <Text style={styles.descriptionText}>
              {item.description || "No description added yet."}
            </Text>

            <View style={styles.cardActions}>
              <PrimaryButton
                title="Edit"
                variant="outline"
                style={styles.actionButton}
                onPress={() => handleEdit(item)}
              />
              <PrimaryButton
                title="Delete"
                variant="ghost"
                style={styles.actionButton}
                onPress={() => handleDelete(item._id)}
              />
            </View>
          </AnimatedEntrance>
        ))
      ) : (
        <AnimatedEntrance delay={150} trigger={isFocused}>
          <EmptyState
            title="No menu items yet"
            description="Create your first menu item using the form above."
          />
        </AnimatedEntrance>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 132,
  },
  heroCard: {
    borderRadius: 30,
    overflow: "hidden",
    ...SHADOWS.strong,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  heroEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  heroTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    lineHeight: 36,
    color: COLORS.white,
    marginTop: 8,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  heroMetric: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroMetricValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  heroMetricLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "rgba(255,255,255,0.74)",
    marginTop: 6,
  },
  stockSummary: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stockSummaryLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.74)",
  },
  stockSummaryValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginTop: 16,
    ...SHADOWS.medium,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 8,
  },
  formEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  formTitle: {
    fontFamily: FONTS.display,
    fontSize: 26,
    color: COLORS.text,
    marginTop: 4,
  },
  previewImage: {
    width: "100%",
    height: 210,
    borderRadius: 24,
    marginBottom: 8,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
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
  inlineHint: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 10,
  },
  toggleButton: {
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  toggleText: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 16,
    ...SHADOWS.soft,
  },
  menuImage: {
    width: "100%",
    height: 190,
    borderRadius: 22,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginTop: 14,
  },
  menuName: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  menuMeta: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  menuPrice: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  badgeStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  descriptionText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textMuted,
    marginTop: 14,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});