import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { getMenuItemById } from "../../api/menuApi";
import {
  addReview,
  deleteReview,
  getMenuItemReviews,
  updateReview,
} from "../../api/reviewApi";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import StarRating from "../../components/StarRating";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { COLORS, DEFAULT_IMAGE, FONTS, SHADOWS } from "../../utils/constants";
import {
  extractErrorMessage,
  formatCurrency,
  formatDate,
} from "../../utils/helpers";

export default function MenuDetailsScreen({ route }) {
  const { itemId } = route.params;
  const { user } = useAuth();
  const { addToCart } = useCart();
  const isFocused = useIsFocused();
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

      setItem(itemData.menuItem);
      setReviews(reviewData.reviews || []);

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
  const estimatedTotal = Number(item?.price || 0) * quantity;

  const handleAddToCart = async () => {
    try {
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
              label={item?.isAvailable ? "Available" : "Unavailable"}
              color={item?.isAvailable ? COLORS.success : COLORS.danger}
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
                {averageRating.toFixed(1)} average from {item?.numberOfReviews || 0}{" "}
                reviews
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
            <Text style={styles.metricValue}>{quantity}</Text>
            <Text style={styles.metricLabel}>Current Qty</Text>
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
            >
              <Text style={styles.counterText}>-</Text>
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              style={styles.counterButton}
              onPress={() => setQuantity((current) => current + 1)}
            >
              <Text style={styles.counterText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.checkoutRow}>
          <View>
            <Text style={styles.checkoutLabel}>Estimated subtotal</Text>
            <Text style={styles.checkoutValue}>{formatCurrency(estimatedTotal)}</Text>
          </View>
          <PrimaryButton title="Add To Cart" onPress={handleAddToCart} style={styles.cta} />
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
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    ...SHADOWS.strong,
  },
  imageWrap: {
    position: "relative",
    minHeight: 360,
  },
  image: {
    width: "100%",
    height: 360,
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
    justifyContent: "space-between",
    gap: 10,
  },
  heroContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: COLORS.white,
  },
  heroSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 6,
    lineHeight: 20,
  },
  pricePill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  ratingRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },
  ratingLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
    marginTop: 8,
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textMuted,
    marginTop: 18,
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    ...SHADOWS.soft,
  },
  metricValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  metricLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  ingredientsCard: {
    marginTop: 18,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 26,
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
  ingredientsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  ingredientChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingredientText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.text,
    textTransform: "capitalize",
  },
  quantityCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontFamily: FONTS.display,
    fontSize: 26,
    color: COLORS.text,
    marginTop: 4,
  },
  sectionHint: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.primary,
    marginTop: 8,
  },
  quantityPanel: {
    marginTop: 18,
    padding: 18,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceMuted,
  },
  panelLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterText: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  quantityText: {
    fontFamily: FONTS.display,
    fontSize: 32,
    color: COLORS.text,
  },
  checkoutRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
  },
  checkoutLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  checkoutValue: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    marginTop: 6,
  },
  cta: {
    minWidth: 160,
  },
  reviewCard: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 28,
    padding: 20,
    ...SHADOWS.medium,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 22,
    marginBottom: 4,
  },
  reviewItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 12,
    ...SHADOWS.soft,
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  reviewerName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
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
    fontSize: 16,
    color: COLORS.primary,
  },
  reviewComment: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginTop: 10,
  },
});
