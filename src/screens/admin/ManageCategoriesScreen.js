import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../api/categoryApi";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, FONTS, SHADOWS } from "../../utils/constants";
import { extractErrorMessage } from "../../utils/helpers";

const initialForm = {
  name: "",
  description: "",
  isActive: true,
};

export default function ManageCategoriesScreen() {
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isFocused) {
      loadCategories();
    }
  }, [isFocused]);

  const loadCategories = async () => {
    try {
      setError("");
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load categories"));
    }
  };

  const metrics = useMemo(() => {
    const active = categories.filter((category) => category.isActive).length;

    return {
      active,
      inactive: categories.length - active,
    };
  }, [categories]);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      if (editingId) {
        await updateCategory(editingId, form);
        Alert.alert("Updated", "Category updated successfully");
      } else {
        await createCategory(form);
        Alert.alert("Created", "Category created successfully");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      Alert.alert("Category Error", extractErrorMessage(error, "Failed to save category"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (error) {
      Alert.alert("Delete Error", extractErrorMessage(error, "Failed to delete category"));
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AnimatedEntrance trigger={isFocused}>
        <SectionTitle
          eyebrow="Admin"
          title="Category Management"
          subtitle="Create and maintain the food categories used across the menu."
        />
      </AnimatedEntrance>

      <AnimatedEntrance delay={60} trigger={isFocused} style={styles.heroCard}>
        <LinearGradient
          colors={["#1B1720", "#5A485F", "#9E877A"]}
          style={styles.heroGradient}
        >
          <Text style={styles.heroEyebrow}>Taxonomy Control</Text>
          <Text style={styles.heroTitle}>Keep the menu organized before dishes go live.</Text>

          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{categories.length}</Text>
              <Text style={styles.heroMetricLabel}>All Categories</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{metrics.active}</Text>
              <Text style={styles.heroMetricLabel}>Active</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{metrics.inactive}</Text>
              <Text style={styles.heroMetricLabel}>Inactive</Text>
            </View>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      <AnimatedEntrance delay={110} trigger={isFocused} style={styles.formCard}>
        <View style={styles.formHeader}>
          <View>
            <Text style={styles.formEyebrow}>
              {editingId ? "Editing Category" : "Create Category"}
            </Text>
            <Text style={styles.formTitle}>
              {editingId ? "Update category details" : "Add a new food group"}
            </Text>
          </View>
          <StatusBadge
            label={form.isActive ? "Active" : "Inactive"}
            color={form.isActive ? COLORS.success : COLORS.warning}
          />
        </View>

        <FormInput
          label="Category Name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
          placeholder="Burgers"
        />
        <FormInput
          label="Description"
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
          placeholder="All burger items"
          multiline
        />
        <Pressable
          style={[styles.toggleButton, form.isActive && styles.toggleButtonActive]}
          onPress={() => updateField("isActive", !form.isActive)}
        >
          <Text
            style={[
              styles.toggleText,
              form.isActive && styles.toggleTextActive,
            ]}
          >
            {form.isActive ? "Category is Active" : "Category is Inactive"}
          </Text>
        </Pressable>
        <PrimaryButton
          title={editingId ? "Update Category" : "Create Category"}
          onPress={handleSubmit}
          loading={saving}
        />
        {editingId ? (
          <PrimaryButton title="Cancel Edit" variant="outline" onPress={resetForm} />
        ) : null}
      </AnimatedEntrance>

      {error ? (
        <AnimatedEntrance delay={150} trigger={isFocused}>
          <EmptyState title="Cannot load categories" description={error} />
        </AnimatedEntrance>
      ) : categories.length ? (
        categories.map((category, index) => (
          <AnimatedEntrance
            key={category._id}
            delay={160 + index * 35}
            trigger={isFocused}
            style={styles.categoryCard}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <StatusBadge
                label={category.isActive ? "Active" : "Inactive"}
                color={category.isActive ? COLORS.success : COLORS.warning}
              />
            </View>
            <Text style={styles.categoryDescription}>
              {category.description || "No description added."}
            </Text>
            <View style={styles.actionRow}>
              <PrimaryButton
                title="Edit"
                variant="outline"
                style={styles.smallButton}
                onPress={() => handleEdit(category)}
              />
              <PrimaryButton
                title="Delete"
                variant="ghost"
                style={styles.smallButton}
                onPress={() => handleDelete(category._id)}
              />
            </View>
          </AnimatedEntrance>
        ))
      ) : (
        <AnimatedEntrance delay={150} trigger={isFocused}>
          <EmptyState
            title="No categories yet"
            description="Create your first category using the form above."
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
    color: "rgba(255,255,255,0.74)",
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
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
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
    marginBottom: 2,
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
  toggleButton: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 16,
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
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 14,
    ...SHADOWS.soft,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  categoryName: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    flex: 1,
  },
  categoryDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 10,
    lineHeight: 21,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
  },
});
