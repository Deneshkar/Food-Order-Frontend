import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { getMenuItemById } from "../../api/menuApi";
import { addReview, deleteReview, getMenuItemReviews, updateReview } from "../../api/reviewApi";
import EmptyState from "../../components/EmptyState";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import StarRating from "../../components/StarRating";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { COLORS, DEFAULT_IMAGE, FONTS, SHADOWS } from "../../utils/constants";
import { extractErrorMessage, formatCurrency, formatDate } from "../../utils/helpers";

export default function MenuDetailsScreen({ route }) {
  const { itemId } = route.params;
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemData, reviewData] = await Promise.all([
        getMenuItemById(itemId),
        getMenuItemReviews(itemId),
      ]);

      const loadedItem = itemData.menuItem;
      setItem(loadedItem);
      setReviews(reviewData.reviews || []);

      const maxStock = Math.max(1, Number(loadedItem?.quantity || 0));
      setQuantity((current) => Math.min(current, maxStock));

      const currentReview = (reviewData.reviews || []).find(
        (review) => review.user?._id === user?._id
      );

      if (currentReview) {
        setReviewRating(currentReview.rating);
        setReviewComment(currentReview.comment || "");
      } else {
        setReviewRating(5);
        setReviewComment("");
      }
    } catch (error) {
      Alert.alert("Load Failed", extractErrorMessage(error, "Failed to load item"));
    } finally {
      setLoading(false);
    }
  };

  const myReview = reviews.find((review) => review.user?._id === user?._id);
  const averageRating = Number(item?.averageRating || 0);
  const availableStock = Number(item?.quantity || 0);
  const maxSelectableQuantity = Math.max(1, availableStock);
  const estimatedTotal = Number(item?.price || 0) * quantity;
  const isOutOfStock = !item?.isAvailable || availableStock <= 0;

  const handleAddToCart = async () => {
    try {
      if (isOutOfStock) {
        Alert.alert("Out of Stock", "This item is currently unavailable.");
        return;
      }

      if (quantity > availableStock) {
        Alert.alert("Stock Limit", `Only ${availableStock} item(s) are available.`);
        return;
      }

      await addToCart(itemId, quantity);
      Alert.alert("Success", "Item added to cart");
    } catch (error) {
      Alert.alert("Cart Error", error.message);
    }
  };

  const handleSaveReview = async () => {
    try {
      if (myReview) {
        await updateReview(myReview._id, {
          rating: reviewRating,
          comment: reviewComment,
        });
        Alert.alert("Success", "Review updated successfully");
      } else {
        await addReview({
          menuItemId: itemId,
          rating: reviewRating,
          comment: reviewComment,
        });
        Alert.alert("Success", "Review added successfully");
      }

      await loadData();
    } catch (error) {
      Alert.alert("Review Error", extractErrorMessage(error, "Failed to save review"));
    }
  };

  const handleDeleteReview = async () => {
    if (!myReview) {
      return;
    }

    try {
      await deleteReview(myReview._id);
      Alert.alert("Deleted", "Review deleted successfully");
      await loadData();
    } catch (error) {
      Alert.alert("Delete Error", extractErrorMessage(error, "Failed to delete review"));
    }
  };

  if (!item && !loading) {
    return (
      <ScreenContainer>
        <EmptyState
          title="Menu item not found"
          description="Please go back and choose another dish."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AnimatedEntrance trigger={isFocused} style={styles.heroCard}>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: item?.image?.url || DEFAULT_IMAGE }}
            style={styles.image}
          />
          <LinearGradient
            colors={["rgba(22, 9, 4, 0.05)", "rgba(22, 9, 4, 0.7)"]}
            style={styles.imageOverlay}
          />

          <View style={styles.badgeRow}>
            <StatusBadge
              label={item?.category?.name || "Special"}
              color={COLORS.secondary}
            />
            <StatusBadge
              label={isOutOfStock ? "Out of Stock" : "Available"}
              color={isOutOfStock ? COLORS.danger : COLORS.success}
            />
            <StatusBadge
              label={`Stock: ${availableStock}`}
              color={availableStock > 0 ? COLORS.info : COLORS.warning}
            />
          </View>

          <View style={styles.heroContent}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item?.name}</Text>
                <Text style={styles.heroSubtitle}>
                  Crafted for quick ordering and a better delivery experience.
                </Text>
              </View>
              <View style={styles.pricePill}>
                <Text style={styles.price}>{formatCurrency(item?.price)}</Text>
              </View>
            </View>

            <View style={styles.ratingRow}>
              <StarRating rating={averageRating} size="large" />
              <Text style={styles.ratingLabel}>
                {averageRating.toFixed(1)} average from {item?.numberOfReviews || 0} reviews
              </Text>
            </View>
          </View>
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={90} trigger={isFocused}>
        <Text style={styles.description}>
          {item?.description || "Freshly prepared menu item."}
        </Text>
      </AnimatedEntrance>

      <AnimatedEntrance delay={140} trigger={isFocused}>
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{item?.preparationTime || 20} min</Text>
            <Text style={styles.metricLabel}>Kitchen Prep</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{item?.ingredients?.length || 0}</Text>
            <Text style={styles.metricLabel}>Ingredients</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{availableStock}</Text>
            <Text style={styles.metricLabel}>In Stock</Text>
          </View>
        </View>
      </AnimatedEntrance>

      {item?.ingredients?.length ? (
        <AnimatedEntrance delay={190} trigger={isFocused} style={styles.ingredientsCard}>
          <Text style={styles.sectionEyebrow}>Ingredients</Text>
          <View style={styles.ingredientsRow}>
            {item.ingredients.map((ingredient) => (
              <View key={ingredient} style={styles.ingredientChip}>
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </AnimatedEntrance>
      ) : null}

      <AnimatedEntrance delay={240} trigger={isFocused} style={styles.quantityCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Quick Order</Text>
            <Text style={styles.sectionTitle}>Add this dish to your cart</Text>
          </View>
          <Text style={styles.sectionHint}>{formatCurrency(estimatedTotal)}</Text>
        </View>

        <View style={styles.quantityPanel}>
          <Text style={styles.panelLabel}>Choose quantity</Text>
          <View style={styles.quantityRow}>
            <Pressable
              style={styles.counterButton}
              onPress={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={isOutOfStock}
            >
              <Text style={styles.counterText}>-</Text>
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              style={styles.counterButton}
              onPress={() =>
                setQuantity((current) =>
                  Math.min(maxSelectableQuantity, current + 1)
                )
              }
              disabled={isOutOfStock}
            >
              <Text style={styles.counterText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.stockHint}>
            {isOutOfStock
              ? "This dish is out of stock."
              : `You can add up to ${availableStock} item(s).`}
          </Text>
        </View>

        <View style={styles.checkoutRow}>
          <View>
            <Text style={styles.checkoutLabel}>Estimated subtotal</Text>
            <Text style={styles.checkoutValue}>{formatCurrency(estimatedTotal)}</Text>
          </View>
          <PrimaryButton
            title={isOutOfStock ? "Out of Stock" : "Add To Cart"}
            onPress={handleAddToCart}
            style={styles.cta}
            disabled={isOutOfStock}
          />
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={290} trigger={isFocused} style={styles.reviewCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Your Review</Text>
            <Text style={styles.sectionTitle}>
              {myReview ? "Update your feedback" : "Rate this dish"}
            </Text>
          </View>
          <Text style={styles.sectionHint}>{reviewRating}/5</Text>
        </View>

        <StarRating
          rating={reviewRating}
          selectable
          onChange={setReviewRating}
          size="large"
        />
        <FormInput
          label="Comment"
          value={reviewComment}
          onChangeText={setReviewComment}
          placeholder="Tell others what you think"
          multiline
        />
        <PrimaryButton
          title={myReview ? "Update Review" : "Submit Review"}
          onPress={handleSaveReview}
        />
        {myReview ? (
          <PrimaryButton
            title="Delete Review"
            variant="outline"
            onPress={handleDeleteReview}
          />
        ) : null}
      </AnimatedEntrance>

      <AnimatedEntrance delay={340} trigger={isFocused}>
        <View style={styles.reviewHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Customer Notes</Text>
            <Text style={styles.sectionTitle}>What other customers said</Text>
          </View>
          <Text style={styles.sectionHint}>{reviews.length} total</Text>
        </View>
      </AnimatedEntrance>

      {reviews.length ? (
        reviews.map((review, index) => (
          <AnimatedEntrance
            key={review._id}
            delay={380 + index * 50}
            trigger={isFocused}
            style={styles.reviewItem}
          >
            <View style={styles.reviewTopRow}>
              <View>
                <Text style={styles.reviewerName}>{review.user?.name || "Customer"}</Text>
                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>
              <Text style={styles.reviewScore}>{review.rating}/5</Text>
            </View>
            <StarRating rating={review.rating} />
            <Text style={styles.reviewComment}>{review.comment || "No comment"}</Text>
          </AnimatedEntrance>
        ))
      ) : (
        <AnimatedEntrance delay={380} trigger={isFocused}>
          <EmptyState
            title="No reviews yet"
            description="Be the first person to rate this dish."
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
    borderRadius: 28,
    overflow: "hidden",
    ...SHADOWS.strong,
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 320,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badgeRow: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroContent: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-end",
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.white,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
    lineHeight: 20,
  },
  pricePill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
  },
  ratingRow: {
    marginTop: 16,
    gap: 8,
  },
  ratingLabel: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
  },
  description: {
    marginTop: 18,
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textMuted,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  metricValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  metricLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  ingredientsCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.text,
    marginTop: 4,
  },
  sectionHint: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  ingredientsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  ingredientChip: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ingredientText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  quantityCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  quantityPanel: {
    marginTop: 16,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 20,
    padding: 18,
  },
  panelLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginTop: 14,
  },
  counterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterText: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
  },
  quantityText: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.text,
    minWidth: 48,
    textAlign: "center",
  },
  stockHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 12,
    textAlign: "center",
  },
  checkoutRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  checkoutLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  checkoutValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    marginTop: 4,
  },
  cta: {
    minWidth: 140,
  },
  reviewCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewItem: {
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
  },
  reviewDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  reviewScore: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.primary,
  },
  reviewComment: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 10,
    lineHeight: 21,
  },
});