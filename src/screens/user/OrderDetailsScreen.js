import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";

import { getOrderById } from "../../api/orderApi";
import { recordPayment } from "../../api/paymentApi";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, FONTS, PAYMENT_METHODS } from "../../utils/constants";
import {
  extractErrorMessage,
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "../../utils/helpers";

export default function OrderDetailsScreen({ route }) {
  const { orderId } = route.params;
  const isFocused = useIsFocused();
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isFocused) {
      loadOrder();
    }
  }, [isFocused]);

  const loadOrder = async () => {
    try {
      setError("");
      const data = await getOrderById(orderId);
      setOrder(data.order);
      setPaymentMethod(data.order?.paymentMethod || PAYMENT_METHODS[0]);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load order"));
    }
  };

  const handleRecordPayment = async () => {
    try {
      setPaymentLoading(true);
      await recordPayment({
        orderId,
        paymentMethod,
        transactionId,
        notes,
      });

      Alert.alert("Payment Saved", "Payment information was recorded successfully.");
      await loadOrder();
    } catch (error) {
      Alert.alert("Payment Error", extractErrorMessage(error, "Failed to record payment"));
    } finally {
      setPaymentLoading(false);
    }
  };

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState title="Order not available" description={error} />
      </ScreenContainer>
    );
  }

  if (!order) {
    return (
      <ScreenContainer>
        <EmptyState title="Loading order" description="Please wait a moment." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <SectionTitle
        eyebrow="Order Details"
        title={`#${order._id.slice(-6).toUpperCase()}`}
        subtitle={formatDate(order.createdAt)}
      />

      <View style={styles.statusRow}>
        <StatusBadge
          label={order.orderStatus}
          color={getOrderStatusColor(order.orderStatus)}
        />
        <StatusBadge
          label={`Payment: ${order.paymentStatus}`}
          color={getPaymentStatusColor(order.paymentStatus)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <Text style={styles.cardText}>{order.deliveryAddress}</Text>
        {order.notes ? (
          <>
            <Text style={[styles.cardTitle, { marginTop: 14 }]}>Notes</Text>
            <Text style={styles.cardText}>{order.notes}</Text>
          </>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {order.orderItems.map((item) => (
        <View key={`${item.menuItem}-${item.name}`} style={styles.itemCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>Quantity: {item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
        </View>
      ))}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pricing</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Items Price</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.itemsPrice)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charge</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.deliveryCharge)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order.totalPrice)}</Text>
        </View>
      </View>

      {order.paymentStatus !== "Paid" && order.paymentStatus !== "Refunded" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Record Payment</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((method) => {
              const active = paymentMethod === method;

              return (
                <Pressable
                  key={method}
                  style={[styles.methodChip, active && styles.activeMethodChip]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.methodText,
                      active && styles.activeMethodText,
                    ]}
                  >
                    {method}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <FormInput
            label="Transaction ID"
            value={transactionId}
            onChangeText={setTransactionId}
            placeholder="Only needed for digital payments"
          />
          <FormInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional payment note"
            multiline
          />
          <PrimaryButton
            title="Save Payment"
            onPress={handleRecordPayment}
            loading={paymentLoading}
          />
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 18,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text,
  },
  cardText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 21,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 8,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  itemMeta: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  itemPrice: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.primary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
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
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 16,
  },
  totalLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  methodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  activeMethodChip: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  methodText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    fontSize: 13,
  },
  activeMethodText: {
    color: COLORS.white,
  },
});
