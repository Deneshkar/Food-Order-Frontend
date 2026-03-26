import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { placeOrder } from "../../api/orderApi";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { COLORS, FONTS, SHADOWS } from "../../utils/constants";
import { extractErrorMessage, formatCurrency } from "../../utils/helpers";

export default function CartScreen({ navigation }) {
  const { user } = useAuth();
  const { cart, refreshCart, updateCartItem, removeCartItem, clearCart } = useCart();
  const isFocused = useIsFocused();
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [notes, setNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (isFocused) {
      refreshCart();
    }
  }, [isFocused]);

  useEffect(() => {
    setDeliveryAddress(user?.address || "");
  }, [user?.address]);

  const totalUnits = useMemo(
    () =>
      (cart.items || []).reduce(
        (count, item) => count + Number(item.quantity || 0),
        0
      ),
    [cart.items]
  );

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      const data = await placeOrder({
        deliveryAddress,
        notes,
      });

      await refreshCart();
      Alert.alert("Order Placed", "Your order was created successfully");
      navigation.navigate("OrderDetails", { orderId: data.order._id });
    } catch (error) {
      Alert.alert("Order Error", extractErrorMessage(error, "Failed to place order"));
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      Alert.alert("Clear Error", error.message);
    }
  };

  if (!cart.items.length) {
    return (
      <ScreenContainer>
        <SectionTitle
          eyebrow="Shopping Cart"
          title="Your Cart"
          subtitle="Add food items from the menu and they will appear here."
        />
        <EmptyState
          title="Your cart is empty"
          description="Choose something delicious from the menu first."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AnimatedEntrance trigger={isFocused}>
        <SectionTitle
          eyebrow="Shopping Cart"
          title="Review Your Items"
          subtitle="Update quantities, confirm delivery details, then place the order."
        />
      </AnimatedEntrance>

      <AnimatedEntrance delay={70} trigger={isFocused} style={styles.heroCard}>
        <LinearGradient
          colors={["#3A170A", "#9A421C", "#E3963A"]}
          style={styles.heroGradient}
        >
          <Text style={styles.heroEyebrow}>Ready For Checkout</Text>
          <Text style={styles.heroTitle}>Keep the cart tight before you send it.</Text>

          <View style={styles.heroMetrics}>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{totalUnits}</Text>
              <Text style={styles.heroMetricLabel}>Items</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>
                {formatCurrency(cart.deliveryCharge)}
              </Text>
              <Text style={styles.heroMetricLabel}>Delivery</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{formatCurrency(cart.totalPrice)}</Text>
              <Text style={styles.heroMetricLabel}>Total</Text>
            </View>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      {cart.items.map((item, index) => (
        <AnimatedEntrance
          key={item.menuItemId}
          delay={120 + index * 45}
          trigger={isFocused}
          style={styles.itemCard}
        >
          <View style={styles.itemTopRow}>
            <View style={styles.itemIdentity}>
              <View style={styles.itemAvatar}>
                <Text style={styles.itemAvatarText}>
                  {(item.name || "F").slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{formatCurrency(item.price)} each</Text>
              </View>
            </View>
            <Text style={styles.itemSubtotal}>{formatCurrency(item.subtotal)}</Text>
          </View>

          <View style={styles.itemBottomRow}>
            <View style={styles.counterWrap}>
              <Pressable
                style={styles.counterButton}
                onPress={() =>
                  updateCartItem(item.menuItemId, Math.max(1, item.quantity - 1))
                }
              >
                <Text style={styles.counterText}>-</Text>
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable
                style={styles.counterButton}
                onPress={() => updateCartItem(item.menuItemId, item.quantity + 1)}
              >
                <Text style={styles.counterText}>+</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.removeChip}
              onPress={() => removeCartItem(item.menuItemId)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        </AnimatedEntrance>
      ))}

      <AnimatedEntrance delay={260} trigger={isFocused} style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryEyebrow}>Delivery Details</Text>
            <Text style={styles.summaryTitle}>Finish the order</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillText}>{cart.items.length} lines</Text>
          </View>
        </View>

        <FormInput
          label="Delivery Address"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Enter delivery address"
          multiline
        />
        <FormInput
          label="Order Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any special request"
          multiline
        />

        <View style={styles.pricePanel}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Items Price</Text>
            <Text style={styles.priceValue}>{formatCurrency(cart.itemsPrice)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Charge</Text>
            <Text style={styles.priceValue}>{formatCurrency(cart.deliveryCharge)}</Text>
          </View>

          <LinearGradient
            colors={["#FFF0DA", "#FFE2B4"]}
            style={styles.totalHighlight}
          >
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(cart.totalPrice)}</Text>
          </LinearGradient>
        </View>

        <PrimaryButton
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={placingOrder}
        />
        <PrimaryButton title="Clear Cart" variant="outline" onPress={handleClearCart} />
      </AnimatedEntrance>
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
    marginBottom: 2,
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
    color: COLORS.white,
    marginTop: 8,
    lineHeight: 36,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  heroMetricCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroMetricValue: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.white,
  },
  heroMetricLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 14,
    ...SHADOWS.soft,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  itemIdentity: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  itemAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  itemAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.primaryDark,
  },
  itemName: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  itemMeta: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  itemSubtotal: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  itemBottomRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  counterWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceMuted,
  },
  counterButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterText: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  quantityText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
    minWidth: 24,
    textAlign: "center",
  },
  removeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: `${COLORS.danger}12`,
  },
  removeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: COLORS.danger,
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 2,
  },
  summaryEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summaryTitle: {
    fontFamily: FONTS.display,
    fontSize: 26,
    color: COLORS.text,
    marginTop: 4,
  },
  summaryPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceAlt,
  },
  summaryPillText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  pricePanel: {
    marginTop: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceMuted,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  priceLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  priceValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  totalHighlight: {
    marginTop: 16,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.primaryDark,
  },
});
