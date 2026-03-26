import { COLORS } from "./constants";

export const formatCurrency = (value = 0) => {
  return `LKR ${Number(value || 0).toFixed(2)}`;
};

export const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleString();
};

export const getOrderStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return COLORS.warning;
    case "Confirmed":
      return COLORS.info;
    case "Preparing":
      return COLORS.primary;
    case "Out for Delivery":
      return COLORS.tertiary;
    case "Delivered":
      return COLORS.success;
    default:
      return COLORS.textMuted;
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return COLORS.warning;
    case "Paid":
      return COLORS.success;
    case "Failed":
      return COLORS.danger;
    case "Refunded":
      return COLORS.info;
    default:
      return COLORS.textMuted;
  }
};

export const extractErrorMessage = (error, fallbackMessage) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage ||
    "Something went wrong"
  );
};
