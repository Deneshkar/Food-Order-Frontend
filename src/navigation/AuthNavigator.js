import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PublicHomeScreen from "../screens/public/PublicHomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="PublicHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="PublicHome" component={PublicHomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}