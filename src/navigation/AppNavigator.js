import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";

import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import UserNavigator from "./UserNavigator";
import { useAuth } from "../hooks/useAuth";
import { COLORS } from "../utils/constants";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

export default function AppNavigator() {
  const { user, token, initializing } = useAuth();

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!token || !user ? (
        <AuthNavigator />
      ) : user.role === "admin" ? (
        <AdminNavigator />
      ) : (
        <UserNavigator />
      )}
    </NavigationContainer>
  );
}
