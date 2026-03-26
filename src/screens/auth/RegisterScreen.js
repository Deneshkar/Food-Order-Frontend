import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, FONTS } from "../../utils/constants";

export default function RegisterScreen({ navigation }) {
  const { register, authLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleRegister = async () => {
    try {
      await register({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
    } catch (error) {
      Alert.alert("Registration Failed", error.message);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Create Account</Text>
        <Text style={styles.title}>Get your food workflow in one place.</Text>
        <Text style={styles.subtitle}>
          Register as a customer now. Admin access can be given later from the backend.
        </Text>
      </View>

      <View style={styles.card}>
        <FormInput
          label="Full Name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
          placeholder="Nimal Perera"
        />
        <FormInput
          label="Email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          placeholder="nimal@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Password"
          value={form.password}
          onChangeText={(value) => updateField("password", value)}
          placeholder="Minimum 6 characters"
          secureTextEntry
          autoCapitalize="none"
        />
        <FormInput
          label="Phone"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          placeholder="0771234567"
          keyboardType="phone-pad"
        />
        <FormInput
          label="Address"
          value={form.address}
          onChangeText={(value) => updateField("address", value)}
          placeholder="Colombo"
          multiline
        />

        <PrimaryButton
          title="Create Account"
          onPress={handleRegister}
          loading={authLoading}
        />

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>
            Already registered? <Text style={styles.linkStrong}>Login here</Text>
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 8,
  },
  eyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 30,
    color: COLORS.text,
    marginTop: 10,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 21,
  },
  card: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
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
