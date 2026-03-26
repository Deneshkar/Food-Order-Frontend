import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

import { updateMyProfile } from "../../api/userApi";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import { useAuth } from "../../hooks/useAuth";
import { COLORS, DEFAULT_IMAGE, FONTS } from "../../utils/constants";
import { extractErrorMessage } from "../../utils/helpers";

export default function ProfileScreen() {
  const { user, logout, updateCurrentUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        password: "",
      });
    }
  }, [user]);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        profileImage: selectedImage,
      };
      const data = await updateMyProfile(payload);
      await updateCurrentUser(data.user);
      setSelectedImage(null);
      setForm((current) => ({
        ...current,
        password: "",
      }));
      Alert.alert("Saved", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Update Failed", extractErrorMessage(error, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScreenContainer>
      <SectionTitle
        eyebrow={user?.role === "admin" ? "Administrator" : "Customer"}
        title="Your Profile"
        subtitle="Update your personal details, password, and profile image."
      />

      <LinearGradient colors={["#FFF1D4", "#FFFDF8"]} style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={styles.avatarRing}>
            <Image
              source={{ uri: selectedImage?.uri || user?.profileImage || DEFAULT_IMAGE }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.profileSummary}>
            <Text style={styles.nameText}>{user?.name}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === "admin" ? "Admin Account" : "Customer Account"}
              </Text>
            </View>
          </View>
        </View>
        <Pressable style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Choose Photo</Text>
        </Pressable>
      </LinearGradient>

      <View style={styles.formCard}>
        <FormInput
          label="Full Name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
          placeholder="Full name"
        />
        <FormInput
          label="Email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Phone"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />
        <FormInput
          label="Address"
          value={form.address}
          onChangeText={(value) => updateField("address", value)}
          placeholder="Delivery address"
          multiline
        />
        <FormInput
          label="New Password"
          value={form.password}
          onChangeText={(value) => updateField("password", value)}
          placeholder="Leave blank if you do not want to change it"
          secureTextEntry
          autoCapitalize="none"
        />

        <PrimaryButton title="Save Profile" onPress={handleSave} loading={saving} />
        <PrimaryButton title="Logout" variant="outline" onPress={handleLogout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 12,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarRing: {
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: "rgba(198, 93, 46, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  profileSummary: {
    flex: 1,
  },
  nameText: {
    fontFamily: FONTS.display,
    fontSize: 28,
    color: COLORS.text,
  },
  emailText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.white,
  },
  imageButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  imageButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text,
  },
  formCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
