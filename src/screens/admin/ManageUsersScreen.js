import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import {
  changeUserRole,
  createUserByAdmin,
  deleteUserByAdmin,
  getAllUsers,
  updateUserByAdmin,
} from "../../api/userApi";
import AnimatedEntrance from "../../components/AnimatedEntrance";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionTitle from "../../components/SectionTitle";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, FONTS, SHADOWS } from "../../utils/constants";
import { extractErrorMessage } from "../../utils/helpers";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  role: "user",
};

export default function ManageUsersScreen() {
  const isFocused = useIsFocused();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadUsers();
    }
  }, [isFocused]);

  const loadUsers = async () => {
    try {
      setError("");
      const data = await getAllUsers(search.trim() ? { search: search.trim() } : {});
      setUsers(data.users || []);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to load users"));
    }
  };

  const metrics = useMemo(() => {
    const admins = users.filter((user) => user.role === "admin").length;

    return {
      admins,
      members: users.length - admins,
    };
  }, [users]);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openCreateForm = () => {
    setCreating(true);
    setEditingUserId("");
    setForm(initialForm);
  };

  const handleEdit = (user) => {
    setCreating(false);
    setEditingUserId(user._id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      password: "",
      role: user.role || "user",
    });
  };

  const resetForm = () => {
    setCreating(false);
    setEditingUserId("");
    setForm(initialForm);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (creating) {
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
          Alert.alert("Validation", "Name, email, and password are required");
          return;
        }

        await createUserByAdmin(form);
        Alert.alert("Success", "User created successfully");
      } else {
        await updateUserByAdmin(editingUserId, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
        });
        Alert.alert("Success", "User updated successfully");
      }

      resetForm();
      await loadUsers();
    } catch (error) {
      Alert.alert(
        creating ? "Create Error" : "Update Error",
        extractErrorMessage(error, creating ? "Failed to create user" : "Failed to update user")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (user) => {
    try {
      const nextRole = user.role === "admin" ? "user" : "admin";
      await changeUserRole(user._id, nextRole);
      await loadUsers();
    } catch (error) {
      Alert.alert("Role Error", extractErrorMessage(error, "Failed to change user role"));
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUserByAdmin(id);
            await loadUsers();
          } catch (error) {
            Alert.alert("Delete Error", extractErrorMessage(error, "Failed to delete user"));
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AnimatedEntrance trigger={isFocused}>
        <SectionTitle
          eyebrow="Admin"
          title="User Management"
          subtitle="Create, search, update, change roles, and delete user accounts."
        />
      </AnimatedEntrance>

      <AnimatedEntrance delay={60} trigger={isFocused} style={styles.heroCard}>
        <LinearGradient
          colors={["#171521", "#40366D", "#7E69B7"]}
          style={styles.heroGradient}
        >
          <Text style={styles.heroEyebrow}>People Console</Text>
          <Text style={styles.heroTitle}>Keep account quality high as the platform grows.</Text>

          <View style={styles.heroMetrics}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{users.length}</Text>
              <Text style={styles.heroMetricLabel}>Total Users</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{metrics.admins}</Text>
              <Text style={styles.heroMetricLabel}>Admins</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricValue}>{metrics.members}</Text>
              <Text style={styles.heroMetricLabel}>Members</Text>
            </View>
          </View>
        </LinearGradient>
      </AnimatedEntrance>

      <AnimatedEntrance delay={100} trigger={isFocused} style={styles.searchCard}>
        <FormInput
          label="Search Users"
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email"
        />
        <PrimaryButton title="Search Directory" onPress={loadUsers} />
        <PrimaryButton title="Create New User" variant="outline" onPress={openCreateForm} />
      </AnimatedEntrance>

      {(creating || editingUserId) ? (
        <AnimatedEntrance delay={140} trigger={isFocused} style={styles.formCard}>
          <View style={styles.formHeader}>
            <View>
              <Text style={styles.formEyebrow}>{creating ? "Create User" : "Editing User"}</Text>
              <Text style={styles.editTitle}>
                {creating ? "Add a new account" : "Update account details"}
              </Text>
            </View>
            <StatusBadge
              label={creating ? "New User" : "Live Edit"}
              color={creating ? COLORS.success : COLORS.info}
            />
          </View>

          <FormInput
            label="Name"
            value={form.name}
            onChangeText={(value) => updateField("name", value)}
            placeholder="Full name"
          />
          <FormInput
            label="Email"
            value={form.email}
            onChangeText={(value) => updateField("email", value)}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {creating ? (
            <FormInput
              label="Password"
              value={form.password}
              onChangeText={(value) => updateField("password", value)}
              placeholder="Minimum 6 characters"
              secureTextEntry
              autoCapitalize="none"
            />
          ) : null}
          <FormInput
            label="Phone"
            value={form.phone}
            onChangeText={(value) => updateField("phone", value)}
            placeholder="Phone"
          />
          <FormInput
            label="Address"
            value={form.address}
            onChangeText={(value) => updateField("address", value)}
            placeholder="Address"
            multiline
          />

          <PrimaryButton
            title={creating ? "Create User" : "Save User"}
            onPress={handleSave}
            loading={saving}
          />
          <PrimaryButton title="Cancel" variant="outline" onPress={resetForm} />
        </AnimatedEntrance>
      ) : null}

      {error ? (
        <AnimatedEntrance delay={150} trigger={isFocused}>
          <EmptyState title="Cannot load users" description={error} />
        </AnimatedEntrance>
      ) : users.length ? (
        users.map((user, index) => (
          <AnimatedEntrance
            key={user._id}
            delay={160 + index * 35}
            trigger={isFocused}
            style={styles.card}
          >
            <View style={styles.header}>
              <View style={styles.identity}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(user.name || "U").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>
              <StatusBadge
                label={user.role === "admin" ? "Admin" : "User"}
                color={user.role === "admin" ? COLORS.secondary : COLORS.primary}
              />
            </View>

            <View style={styles.metaPanel}>
              <View style={styles.metaBlock}>
                <Text style={styles.metaLabel}>Phone</Text>
                <Text style={styles.metaValue}>{user.phone || "Not provided"}</Text>
              </View>
              <View style={styles.metaBlock}>
                <Text style={styles.metaLabel}>Address</Text>
                <Text style={styles.metaValue}>{user.address || "Not provided"}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <PrimaryButton
                title="Edit"
                variant="outline"
                style={styles.actionButton}
                onPress={() => handleEdit(user)}
              />
              <PrimaryButton
                title={user.role === "admin" ? "Make User" : "Make Admin"}
                style={styles.actionButton}
                onPress={() => handleRoleChange(user)}
              />
            </View>
            <PrimaryButton
              title="Delete User"
              variant="ghost"
              onPress={() => handleDelete(user._id)}
            />
          </AnimatedEntrance>
        ))
      ) : (
        <AnimatedEntrance delay={150} trigger={isFocused}>
          <EmptyState
            title="No users found"
            description="Try another search term or create a new user above."
          />
        </AnimatedEntrance>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 132,
  },
  heroCard: {
    borderRadius: 30,
    overflow: "hidden",
    ...SHADOWS.strong,
  },
  heroGradient: {
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  heroEyebrow: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: "rgba(255,255,255,0.74)",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  heroTitle: {
    fontFamily: FONTS.display,
    fontSize: 28,
    lineHeight: 36,
    color: COLORS.white,
    marginTop: 8,
  },
  heroMetrics: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },
  heroMetric: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroMetricValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.white,
  },
  heroMetricLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
  },
  searchCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formCard: {
    marginTop: 18,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  formEyebrow: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: "uppercase",
  },
  editTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
    marginTop: 4,
  },
  card: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  identity: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceAlt,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.primary,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: COLORS.text,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  metaPanel: {
    marginTop: 14,
    gap: 10,
  },
  metaBlock: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 18,
    padding: 14,
  },
  metaLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  metaValue: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text,
    marginTop: 5,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
  },
});