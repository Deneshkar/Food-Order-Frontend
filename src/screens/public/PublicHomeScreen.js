import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { getCategories } from "../../api/categoryApi";
import { getMenuItems } from "../../api/menuApi";
import EmptyState from "../../components/EmptyState";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import { COLORS, DEFAULT_IMAGE, FONTS, SHADOWS } from "../../utils/constants";
import { extractErrorMessage, formatCurrency } from "../../utils/helpers";

const FEATURED_LIMIT = 6;

const normalizeMenuItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.menuItems)) {
    return payload.menuItems;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const normalizeCategories = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.categories)) {
    return payload.categories;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const resolveImageUri = (imageValue) => {
  if (!imageValue) {
    return DEFAULT_IMAGE;
  }

  if (typeof imageValue === "string") {
    return imageValue;
  }

  if (typeof imageValue?.url === "string") {
    return imageValue.url;
  }

  if (typeof imageValue?.uri === "string") {
    return imageValue.uri;
  }

  return DEFAULT_IMAGE;
};

export default function PublicHomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPublicData();
  }, []);

  const activeCategories = useMemo(
    () => categories.filter((category) => category?.isActive !== false),
    [categories]
  );

  const loadPublicData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoriesPayload, menuPayload] = await Promise.all([
        getCategories(),
        getMenuItems({ isAvailable: true }),
      ]);

      const nextCategories = normalizeCategories(categoriesPayload);
      const nextItems = normalizeMenuItems(menuPayload).slice(0, FEATURED_LIMIT);

      setCategories(nextCategories);
      setFeaturedItems(nextItems);
    } catch (requestError) {
      setError(extractErrorMessage(requestError, "Failed to load public content"));
      setCategories([]);
      setFeaturedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderNowAsGuest = () => {
    Alert.alert("Login Required", "Please login to place an order");
  };

  const shouldShowCategoryLoader = loading;
  const shouldShowCategoryEmpty = !loading && !activeCategories.length;
  const shouldShowFeaturedError = !loading && Boolean(error);
  const shouldShowFeaturedEmpty = !loading && !featuredItems.length;

  return (
    <ScreenContainer>
      <LinearGradient colors={["#FFF4DF", "#FFFDF8"]} style={styles.heroPanel}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appName}>Food Order Management System</Text>
            <Text style={styles.tagline}>Browse as guest, order after login.</Text>
          </View>
          <PrimaryButton
            title="Login"
            variant="outline"
            onPress={() => navigation.navigate("Login")}
            style={styles.loginHeaderButton}
          />
        </View>

        <Text style={styles.heroTitle}>Welcome to our shop</Text>
        <Text style={styles.heroSubtitle}>
          Discover popular categories and featured dishes before signing in.
        </Text>

        <View style={styles.heroButtons}>
          <PrimaryButton
            title="Register"
            onPress={() => navigation.navigate("Register")}
            style={styles.ctaButton}
          />
          <PrimaryButton
            title="Login"
            variant="ghost"
            onPress={() => navigation.navigate("Login")}
            style={styles.ctaButton}
          />
        </View>
      </LinearGradient>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
      </View>

      {shouldShowCategoryLoader ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : null}

      {!shouldShowCategoryLoader && activeCategories.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {activeCategories.map((category) => (
              <View key={category._id || category.name} style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{category.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {shouldShowCategoryEmpty ? (
        <EmptyState
          title="No categories yet"
          description="Categories will appear here once they are added from admin."
        />
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Items</Text>
        <Pressable onPress={loadPublicData}>
          <Text style={styles.refreshLink}>Refresh</Text>
        </Pressable>
      </View>

      {shouldShowFeaturedError ? (
        <EmptyState title="Unable to load featured items" description={error} />
      ) : null}

      {shouldShowFeaturedEmpty ? (
        <EmptyState
          title="No featured items"
          description="Please check back soon for new dishes."
        />
      ) : null}

      {loading
        ? null
        : featuredItems.map((item) => (
            <View key={item._id || item.id || item.name} style={styles.card}>
              <Image
                source={{ uri: resolveImageUri(item?.image) }}
                style={styles.itemImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item?.name || "Menu Item"}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item?.description || "Freshly prepared and ready to order."}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.itemPrice}>{formatCurrency(item?.price || 0)}</Text>
                  <Text style={styles.itemCategory}>{item?.category?.name || "General"}</Text>
                </View>
                <PrimaryButton
                  title="Order Now"
                  onPress={handleOrderNowAsGuest}
                  style={styles.orderButton}
                />
              </View>
            </View>
          ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 6,
    ...SHADOWS.soft,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  appName: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.text,
    maxWidth: "86%",
  },
  tagline: {
    marginTop: 6,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  loginHeaderButton: {
    minWidth: 92,
    marginTop: 2,
  },
  heroTitle: {
    marginTop: 16,
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
  },
  heroSubtitle: {
    marginTop: 8,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  heroButtons: {
    marginTop: 10,
  },
  ctaButton: {
    marginTop: 10,
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: 21,
  },
  refreshLink: {
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
    fontSize: 13,
  },
  loaderWrap: {
    marginTop: 10,
    paddingVertical: 18,
    alignItems: "center",
  },
  categoryRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 6,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryChipText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    fontSize: 13,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
    marginTop: 12,
    ...SHADOWS.soft,
  },
  itemImage: {
    width: "100%",
    height: 170,
  },
  itemInfo: {
    padding: 14,
  },
  itemName: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: COLORS.text,
  },
  itemDescription: {
    marginTop: 6,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    fontSize: 16,
  },
  itemCategory: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  orderButton: {
    marginTop: 12,
  },
});