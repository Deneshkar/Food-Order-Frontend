import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Text, View } from "react-native";

import CartScreen from "../screens/user/CartScreen";
import HomeScreen from "../screens/user/HomeScreen";
import MenuDetailsScreen from "../screens/user/MenuDetailsScreen";
import MenuScreen from "../screens/user/MenuScreen";
import OrderDetailsScreen from "../screens/user/OrderDetailsScreen";
import OrdersScreen from "../screens/user/OrdersScreen";
import ProfileScreen from "../screens/user/ProfileScreen";
import { COLORS, FONTS, SHADOWS } from "../utils/constants";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function UserTabs() {
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
            Home: "home",
            Menu: "restaurant",
            Cart: "cart",
            Orders: "receipt",
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function UserNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontFamily: FONTS.bold,
        },
      }}
    >
      <Stack.Screen
        name="UserTabs"
        component={UserTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MenuDetails"
        component={MenuDetailsScreen}
        options={{ title: "Menu Details" }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: "Order Details" }}
      />
    </Stack.Navigator>
  );
}
