import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, FONTS } from "../../utils/constants";

export default function LoginScreen({ navigation }) {
  const { login, authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login({
        email: email.trim(),
        password,
      });
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <ScreenContainer withGradient scroll={false} contentContainerStyle={styles.flex}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Food Order System</Text>
        <Text style={styles.title}>Serve orders faster with one mobile workflow.</Text>
        <Text style={styles.subtitle}>
          Log in to browse menu items, manage your cart, place orders, and track delivery in real time.
        </Text>
      </View>

      <LinearGradient colors={["#FFFDF8", "#FCEBD2"]} style={styles.card}>
        <Text style={styles.cardTitle}>Welcome Back</Text>
        <Text style={styles.cardSubtitle}>
          Use your email and password to continue.
        </Text>

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="nimal@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
        />

        <PrimaryButton
          title="Login"
          onPress={handleLogin}
          loading={authLoading}
        />

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            New here? <Text style={styles.linkStrong}>Create an account</Text>
          </Text>
        </Pressable>
      </LinearGradient>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "space-between",
  },
  hero: {
    paddingTop: 24,
  },
  eyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.surfaceAlt,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 34,
    lineHeight: 40,
    color: COLORS.white,
    marginTop: 12,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "#FCEBD2",
    marginTop: 12,
    maxWidth: 330,
  },
  card: {
    borderRadius: 28,
    padding: 22,
    marginTop: 20,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  },
  cardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  link: {
    textAlign: "center",
    marginTop: 18,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  linkStrong: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
});
