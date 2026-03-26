import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { getCategories } from "../../api/categoryApi";
import { getMenuItems } from "../../api/menuApi";
import { getAllOrders } from "../../api/orderApi";
import { getAllPayments } from "../../api/paymentApi";
import { getAllUsers } from "../../api/userApi";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import EmptyState from "../../components/EmptyState";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, FONTS, SHADOWS } from "../../utils/constants";
import {
  extractErrorMessage,
  formatCurrency,
  getOrderStatusColor,
} from "../../utils/helpers";

export default function AdminDashboardScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isFocused) {
      loadDashboard();
    }
  }, [isFocused]);

  const loadDashboard = async () => {
    try {
      setError("");
      const [usersData, ordersData, menuData, categoryData, paymentsData] =
        await Promise.all([
          getAllUsers(),
          getAllOrders(),
          getMenuItems(),
          getCategories(),
          getAllPayments(),
        ]);

      setStats({
        users: usersData.users || [],
        orders: ordersData.orders || [],
        menuItems: menuData.menuItems || [],
        categories: categoryData.categories || [],
        payments: paymentsData.payments || [],
      });
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load admin dashboard"));
    }
  };

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState title="Dashboard unavailable" description={error} />
      </ScreenContainer>
    );
  }

  if (!stats) {
    return (
      <ScreenContainer>
        <EmptyState title="Loading dashboard" description="Please wait a moment." />
      </ScreenContainer>
    );
  }

  const totalRevenue = stats.payments
    .filter((payment) => payment.paymentStatus === "Paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const quickActions = [
    {
      title: "Manage Categories",
      text: "Create, update, or remove food groups.",
      target: "Categories",
    },
    {
      title: "Manage Menu",
      text: "Upload food images and maintain menu items.",
      target: "Menu",
    },
    {
      title: "Track Orders",
      text: "Move orders through the delivery workflow.",
      target: "Orders",
    },
    {
      title: "Manage Users",
      text: "Update roles, edit records, and review users.",
      target: "Users",
    },
  ];

  return (
    <ScreenContainer withGradient contentContainerStyle={styles.container}>
      <AnimatedEntrance trigger={isFocused} style={styles.heroCardWrap}>
        <LinearGradient colors={["#FFF1D4", "#FFFDF8"]} style={styles.heroCard}>
          <SectionTitle
            eyebrow="Admin Panel"
            title="Dashboard"
            subtitle="Monitor users, orders, menu performance, and payment movement."
          />
          <View style={styles.heroMetrics}>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{stats.orders.length}</Text>
              <Text style={styles.heroMetricLabel}>Live Orders</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{stats.users.length}</Text>
              <Text style={styles.heroMetricLabel}>Platform Users</Text>
            </View>
            <View style={styles.heroMetricCard}>
              <Text style={styles.heroMetricValue}>{formatCurrency(totalRevenue)}</Text>
              <Text style={styles.heroMetricLabel}>Paid Revenue</Text>
            </View>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      <AnimatedEntrance delay={70} trigger={isFocused}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Users</Text>
            <Text style={styles.statValue}>{stats.users.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>{stats.orders.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Menu Items</Text>
            <Text style={styles.statValue}>{stats.menuItems.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Revenue</Text>
            <Text style={styles.statValueSmall}>{formatCurrency(totalRevenue)}</Text>
          </View>
        </View>
      </AnimatedEntrance>

      <AnimatedEntrance delay={120} trigger={isFocused}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </AnimatedEntrance>
      <View style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <AnimatedEntrance
            key={action.target}
            delay={150 + index * 40}
            trigger={isFocused}
          >
            <Pressable
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.target)}
            >
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionText}>{action.text}</Text>
            </Pressable>
          </AnimatedEntrance>
        ))}
      </View>

      <AnimatedEntrance delay={220} trigger={isFocused}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
      </AnimatedEntrance>
      {stats.orders.slice(0, 4).map((order, index) => (
        <AnimatedEntrance
          key={order._id}
          delay={250 + index * 40}
          trigger={isFocused}
          style={styles.orderCard}
        >
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
            <StatusBadge
              label={order.orderStatus}
              color={getOrderStatusColor(order.orderStatus)}
            />
          </View>
          <Text style={styles.orderMeta}>
            {order.user?.name || "Customer"} | {formatCurrency(order.totalPrice)}
          </Text>
        </AnimatedEntrance>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 132,
  },
  heroCardWrap: {
    ...SHADOWS.medium,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  heroCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  heroMetricCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 14,
  },
  heroMetricValue: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.text,
  },
  heroMetricLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statCard: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  statLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statValue: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.text,
    marginTop: 10,
  },
  statValueSmall: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    marginTop: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text,
    marginTop: 22,
    marginBottom: 12,
  },
  quickActions: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  actionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.text,
  },
  actionText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 21,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
    ...SHADOWS.soft,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  orderId: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
  },
  orderMeta: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 10,
  },
});
