import apiClient from "./client";

export const recordPayment = async (payload) => {
  const response = await apiClient.post("/payments", payload);
  return response.data;
};

export const getMyPayments = async () => {
  const response = await apiClient.get("/payments/my-payments");
  return response.data;
};

export const getAllPayments = async () => {
  const response = await apiClient.get("/payments");
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await apiClient.get(`/payments/${id}`);
  return response.data;
};

export const updatePayment = async (id, payload) => {
  const response = await apiClient.put(`/payments/${id}`, payload);
  return response.data;
};

export const deletePayment = async (id) => {
  const response = await apiClient.delete(`/payments/${id}`);
  return response.data;
};

export const updatePaymentStatus = async (id, paymentStatus) => {
  const response = await apiClient.patch(`/payments/${id}/status`, {
    paymentStatus,
  });
  return response.data;
};