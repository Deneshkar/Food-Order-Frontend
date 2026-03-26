const runtimeEnv =
  typeof process !== "undefined" && process?.env ? process.env : {};

export const API_BASE_URL =
  runtimeEnv.EXPO_PUBLIC_API_URL || "http://10.208.126.60:5000/api";

export const COLORS = {
  background: "#FFF8EE",
  surface: "#FFFDF8",
  surfaceAlt: "#FCEAD2",
  surfaceMuted: "#F7F0E4",
  primary: "#C65D2E",
  primaryDark: "#8F3512",
  accent: "#F2A541",
  secondary: "#226F54",
  tertiary: "#2A5C8A",
  text: "#23140A",
  textMuted: "#7B6A58",
  border: "#E6D4BE",
  danger: "#B3261E",
  success: "#2E7D32",
  warning: "#D68C09",
  info: "#2A5C8A",
  white: "#FFFFFF",
  shadow: "rgba(35, 20, 10, 0.12)",
  shadowStrong: "rgba(35, 20, 10, 0.2)",
};

export const FONTS = {
  regular: "Manrope_400Regular",
  semiBold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
  display: "PlayfairDisplay_700Bold",
};

export const SHADOWS = {
  soft: {
    shadowColor: "#2A160B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  medium: {
    shadowColor: "#2A160B",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 7,
  },
  strong: {
    shadowColor: "#2A160B",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
  },
};

export const ORDER_STATUS_FLOW = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

export const PAYMENT_STATUS_FLOW = ["Pending", "Paid", "Failed", "Refunded"];

export const PAYMENT_METHODS = [
  "Cash on Delivery",
  "Card",
  "Online Transfer",
  "Wallet",
];

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80";
