import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Text, View } from "react-native";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ManageCategoriesScreen from "../screens/admin/ManageCategoriesScreen";
import ManageMenuScreen from "../screens/admin/ManageMenuScreen";
import ManageOrdersScreen from "../screens/admin/ManageOrdersScreen";
import ManageUsersScreen from "../screens/admin/ManageUsersScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import { COLORS, FONTS, SHADOWS } from "../utils/constants";

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 14,
          height: 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? 12 : 10,
          borderRadius: 28,
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          ...SHADOWS.strong,
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 2,
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              fontFamily: focused ? FONTS.bold : FONTS.semiBold,
              fontSize: 11,
              color,
              marginTop: 2,
            }}
          >
            {children}
          </Text>
        ),
        tabBarIcon: ({ color, size }) => {
          const iconMap = {
            Dashboard: "grid",
            Categories: "pricetags",
            Menu: "restaurant",
            Orders: "receipt",
            Users: "people",
            Profile: "person",
          };

          return (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: color === COLORS.primary ? "rgba(198, 93, 46, 0.14)" : "transparent",
              }}
            >
              <Ionicons name={iconMap[route.name]} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Categories" component={ManageCategoriesScreen} />
      <Tab.Screen name="Menu" component={ManageMenuScreen} />
      <Tab.Screen name="Orders" component={ManageOrdersScreen} />
      <Tab.Screen name="Users" component={ManageUsersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
