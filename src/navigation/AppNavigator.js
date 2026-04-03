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
  const { user, token, loading } = useAuth();

  if (loading) {
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

  let content = <AuthNavigator />;

  if (token && user) {
    content = user.role === "admin" ? <AdminNavigator /> : <UserNavigator />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>{content}</NavigationContainer>
  );
}
