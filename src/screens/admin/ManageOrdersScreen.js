import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import {
  deleteOrder,
  getAllOrders,
  updateOrder,
  updateOrderStatus,
} from "../../api/orderApi";
import {
  deletePayment,
  updatePaymentStatus,
} from "../../api/paymentApi";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import StatusBadge from "../../components/StatusBadge";
import {
  COLORS,
  FONTS,
  ORDER_STATUS_FLOW,
  SHADOWS,
} from "../../utils/constants";
import {
  extractErrorMessage,
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "../../utils/helpers";

export default function ManageOrdersScreen() {
  const isFocused = useIsFocused();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const [editingOrderId, setEditingOrderId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadOrders();
    }
  }, [isFocused]);

  const loadOrders = async () => {
    try {
      setError("");
      const data = await getAllOrders();
      setOrders(data.orders || []);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load orders"));
    }
  };

  const metrics = useMemo(() => {
    const delivered = orders.filter((order) => order.orderStatus === "Delivered").length;
    const active = orders.filter((order) => order.orderStatus !== "Delivered").length;
    const paidRevenue = orders.reduce((total, order) => {
      if (order.paymentStatus === "Paid") {
        return total + Number(order.totalPrice || 0);
      }
      return total;
    }, 0);

    return {
      delivered,
      active,
      paidRevenue,
    };
  }, [orders]);

  const handleStartEdit = (order) => {
    setEditingOrderId(order._id);
    setDeliveryAddress(order.deliveryAddress || "");
    setNotes(order.notes || "");
  };

  const handleCancelEdit = () => {
    setEditingOrderId("");
    setDeliveryAddress("");
    setNotes("");
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await updateOrder(editingOrderId, {
        deliveryAddress,
        notes,
      });
      handleCancelEdit();
      await loadOrders();
    } catch (error) {
      Alert.alert("Order Error", extractErrorMessage(error, "Failed to update order"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    Alert.alert("Delete Order", "Are you sure you want to delete this order?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteOrder(orderId);
            await loadOrders();
          } catch (error) {
            Alert.alert("Delete Error", extractErrorMessage(error, "Failed to delete order"));
          }
        },
      },
    ]);
  };

  const handleDeletePayment = async (paymentId) => {
    Alert.alert("Delete Payment", "Are you sure you want to delete this payment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePayment(paymentId);
            await loadOrders();
          } catch (error) {
            Alert.alert("Delete Error", extractErrorMessage(error, "Failed to delete payment"));
          }
        },
      },
    ]);
  };

  const handleNextOrderStatus = async (order) => {
    try {
      const currentIndex = ORDER_STATUS_FLOW.indexOf(order.orderStatus);
      const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];

      if (!nextStatus) {
        return;
      }

      await updateOrderStatus(order._id, nextStatus);
      await loadOrders();
    } catch (error) {
      Alert.alert("Order Error", extractErrorMessage(error, "Failed to update order"));
    }
  };

  const handlePaymentAction = async (order) => {
    if (!order.payment?._id) {
      return;
    }

    try {
      const nextStatus =
        order.payment.paymentStatus === "Paid" ? "Refunded" : "Paid";
      await updatePaymentStatus(order.payment._id, nextStatus);
      await loadOrders();
    } catch (error) {
      Alert.alert("Payment Error", extractErrorMessage(error, "Failed to update payment"));
    }
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AnimatedEntrance trigger={isFocused}>
        <SectionTitle
          eyebrow="Admin"
          title="Order Management"
          subtitle="Track, edit, update, delete orders, and keep payments in sync."
        />
      </AnimatedEntrance>

      <AnimatedEntrance delay={60} trigger={isFocused} style={styles.heroCard}>
        <LinearGradient
          colors={["#132019", "#226F54", "#58A78B"]}
          style={styles.heroGradient}
        >
          <Text style={styles.heroEyebrow}>Operations Board</Text>
          <Text style={styles.heroTitle}>Move orders without losing visibility.</Text>

          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{orders.length}</Text>
              <Text style={styles.heroMetricLabel}>Total Orders</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{metrics.active}</Text>
              <Text style={styles.heroMetricLabel}>Active</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{metrics.delivered}</Text>
              <Text style={styles.heroMetricLabel}>Delivered</Text>
            </View>
          </View>

          <View style={styles.revenueRow}>
            <Text style={styles.revenueLabel}>Paid Revenue</Text>
            <Text style={styles.revenueValue}>{formatCurrency(metrics.paidRevenue)}</Text>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      {error ? (
        <AnimatedEntrance delay={110} trigger={isFocused}>
          <EmptyState title="Cannot load orders" description={error} />
        </AnimatedEntrance>
      ) : orders.length ? (
        orders.map((order, index) => {
          const currentIndex = ORDER_STATUS_FLOW.indexOf(order.orderStatus);
          const nextStatus = ORDER_STATUS_FLOW[currentIndex + 1];
          const paymentActionLabel =
            order.payment?.paymentStatus === "Paid"
              ? "Refund Payment"
              : "Mark Payment Paid";

          const isEditingThis = editingOrderId === order._id;

          return (
            <AnimatedEntrance
              key={order._id}
              delay={120 + index * 40}
              trigger={isFocused}
              style={styles.card}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.metaText}>{formatDate(order.createdAt)}</Text>
                </View>
                <Text style={styles.orderTotal}>{formatCurrency(order.totalPrice)}</Text>
              </View>

              <View style={styles.badgeRow}>
                <StatusBadge
                  label={order.orderStatus}
                  color={getOrderStatusColor(order.orderStatus)}
                />
                <StatusBadge
                  label={`Payment: ${order.paymentStatus}`}
                  color={getPaymentStatusColor(order.paymentStatus)}
                />
              </View>

              {isEditingThis ? (
                <View style={styles.editCard}>
                  <FormInput
                    label="Delivery Address"
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    placeholder="Delivery address"
                    multiline
                  />
                  <FormInput
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Order notes"
                    multiline
                  />
                  <PrimaryButton title="Save Order" onPress={handleSaveEdit} loading={saving} />
                  <PrimaryButton title="Cancel" variant="outline" onPress={handleCancelEdit} />
                </View>
              ) : (
                <View style={styles.detailsGrid}>
                  <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>Customer</Text>
                    <Text style={styles.detailValue}>{order.user?.name || "Customer"}</Text>
                  </View>
                  <View style={styles.detailCell}>
                    <Text style={styles.detailLabel}>Items</Text>
                    <Text style={styles.detailValue}>
                      {order.orderItems?.length || 0} dishes
                    </Text>
                  </View>
                  <View style={styles.detailCellWide}>
                    <Text style={styles.detailLabel}>Delivery Address</Text>
                    <Text style={styles.detailValue}>
                      {order.deliveryAddress || "No address provided"}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.progressWrap}>
                {ORDER_STATUS_FLOW.map((status, statusIndex) => {
                  const active = statusIndex <= currentIndex;

                  return (
                    <View
                      key={status}
                      style={[styles.progressChip, active && styles.progressChipActive]}
                    >
                      <Text
                        style={[
                          styles.progressText,
                          active && styles.progressTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {nextStatus ? (
                <PrimaryButton
                  title={`Move to ${nextStatus}`}
                  onPress={() => handleNextOrderStatus(order)}
                />
              ) : null}

              <View style={styles.actionRow}>
                <PrimaryButton
                  title="Edit Order"
                  variant="outline"
                  style={styles.actionButton}
                  onPress={() => handleStartEdit(order)}
                />
                <PrimaryButton
                  title="Delete Order"
                  variant="ghost"
                  style={styles.actionButton}
                  onPress={() => handleDeleteOrder(order._id)}
                />
              </View>

              {order.payment?._id &&
              ["Pending", "Failed", "Paid"].includes(order.payment.paymentStatus) ? (
                <>
                  <PrimaryButton
                    title={paymentActionLabel}
                    variant="outline"
                    onPress={() => handlePaymentAction(order)}
                  />
                  <PrimaryButton
                    title="Delete Payment"
                    variant="ghost"
                    onPress={() => handleDeletePayment(order.payment._id)}
                  />
                </>
              ) : null}
            </AnimatedEntrance>
          );
        })
      ) : (
        <AnimatedEntrance delay={110} trigger={isFocused}>
          <EmptyState
            title="No orders available"
            description="Customer orders will appear here once the frontend places them."
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
  revenueRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.74)",
  },
  revenueValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.white,
  },
  card: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  orderId: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.text,
  },
  metaText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  orderTotal: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  detailsGrid: {
    marginTop: 16,
    gap: 10,
  },
  detailCell: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 18,
    padding: 14,
  },
  detailCellWide: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 18,
    padding: 14,
  },
  detailLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
    marginTop: 5,
  },
  editCard: {
    marginTop: 14,
  },
  progressWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
  },
  progressChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceMuted,
  },
  progressChipActive: {
    backgroundColor: "rgba(198, 93, 46, 0.12)",
  },
  progressText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  progressTextActive: {
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
  },
});