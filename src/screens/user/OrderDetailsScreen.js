import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";

import { deleteOrder, getOrderById, updateOrder } from "../../api/orderApi";
import {
  recordPayment,
  updatePayment,
} from "../../api/paymentApi";
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
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [editingOrder, setEditingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderDeleting, setOrderDeleting] = useState(false);

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
      const loadedOrder = data.order;
      const resolvedPaymentMethod = PAYMENT_METHODS.includes(loadedOrder?.paymentMethod)
        ? loadedOrder.paymentMethod
        : PAYMENT_METHODS[0];

      setOrder(loadedOrder);
      setPaymentMethod(resolvedPaymentMethod);
      setTransactionId(loadedOrder?.payment?.transactionId || "");
      setNotes(loadedOrder?.payment?.notes || "");
      setDeliveryAddress(loadedOrder?.deliveryAddress || "");
      setOrderNotes(loadedOrder?.notes || "");
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load order"));
    }
  };

  const handleRecordPayment = async () => {
    try {
      setPaymentLoading(true);

      if (order?.payment?._id) {
        await updatePayment(order.payment._id, {
          paymentMethod,
          transactionId,
          notes,
        });
        Alert.alert("Payment Updated", "Payment information updated successfully.");
      } else {
        await recordPayment({
          orderId,
          paymentMethod,
          transactionId,
          notes,
        });
        Alert.alert("Payment Saved", "Payment information recorded successfully.");
      }

      await loadOrder();
    } catch (error) {
      Alert.alert("Payment Error", extractErrorMessage(error, "Failed to save payment"));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      setOrderSaving(true);
      await updateOrder(orderId, {
        deliveryAddress,
        notes: orderNotes,
      });
      setEditingOrder(false);
      Alert.alert("Updated", "Order updated successfully.");
      await loadOrder();
    } catch (error) {
      Alert.alert("Order Error", extractErrorMessage(error, "Failed to update order"));
    } finally {
      setOrderSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    Alert.alert("Delete Order", "Are you sure you want to delete this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setOrderDeleting(true);
            await deleteOrder(orderId);
            Alert.alert("Deleted", "Order deleted successfully.");
            navigation.goBack();
          } catch (error) {
            Alert.alert("Delete Error", extractErrorMessage(error, "Failed to delete order"));
          } finally {
            setOrderDeleting(false);
          }
        },
      },
    ]);
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

  const canEditOrDeleteOrder = order.orderStatus === "Pending";

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

        {editingOrder ? (
          <>
            <FormInput
              label="Delivery Address"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Delivery address"
              multiline
            />
            <FormInput
              label="Notes"
              value={orderNotes}
              onChangeText={setOrderNotes}
              placeholder="Optional order note"
              multiline
            />
            <PrimaryButton
              title="Save Order"
              onPress={handleUpdateOrder}
              loading={orderSaving}
            />
            <PrimaryButton
              title="Cancel Edit"
              variant="outline"
              onPress={() => {
                setEditingOrder(false);
                setDeliveryAddress(order.deliveryAddress || "");
                setOrderNotes(order.notes || "");
              }}
            />
          </>
        ) : (
          <>
            <Text style={styles.cardText}>{order.deliveryAddress}</Text>
            {order.notes ? (
              <>
                <Text style={[styles.cardTitle, { marginTop: 14 }]}>Notes</Text>
                <Text style={styles.cardText}>{order.notes}</Text>
              </>
            ) : null}

            {canEditOrDeleteOrder ? (
              <>
                <PrimaryButton
                  title="Edit Order"
                  variant="outline"
                  onPress={() => setEditingOrder(true)}
                />
                <PrimaryButton
                  title="Delete Order"
                  variant="ghost"
                  onPress={handleDeleteOrder}
                  loading={orderDeleting}
                />
              </>
            ) : null}
          </>
        )}
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

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{order.payment?._id ? "Update Payment" : "Record Payment"}</Text>

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
          title={order.payment?._id ? "Update Payment" : "Save Payment"}
          onPress={handleRecordPayment}
          loading={paymentLoading}
        />
      </View>
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
    marginTop: 12,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceMuted,
  },
  activeMethodChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodText: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  activeMethodText: {
    color: COLORS.white,
  },
});