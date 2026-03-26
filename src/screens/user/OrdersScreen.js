import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";

import { getMyOrders } from "../../api/orderApi";
import EmptyState from "../../components/EmptyState";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, FONTS } from "../../utils/constants";
import {
  extractErrorMessage,
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getPaymentStatusColor,
} from "../../utils/helpers";

export default function OrdersScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isFocused) {
      loadOrders();
    }
  }, [isFocused]);

  const loadOrders = async () => {
    try {
      setError("");
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load orders"));
    }
  };

  return (
    <ScreenContainer>
      <SectionTitle
        eyebrow="Order History"
        title="Your Orders"
        subtitle="Track progress, payment status, and open any order for full details."
      />

      {error ? (
        <EmptyState title="Unable to load orders" description={error} />
      ) : orders.length ? (
        orders.map((order) => (
          <Pressable
            key={order._id}
            style={styles.card}
            onPress={() => navigation.navigate("OrderDetails", { orderId: order._id })}
          >
            <View style={styles.header}>
              <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
            </View>
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
            <Text style={styles.infoText}>
              Items: {order.orderItems.length} | Total: {formatCurrency(order.totalPrice)}
            </Text>
          </Pressable>
        ))
      ) : (
        <EmptyState
          title="No orders yet"
          description="Once you place an order from the cart, it will appear here."
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  orderId: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  dateText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 12,
  },
});
