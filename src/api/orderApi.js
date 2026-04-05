import apiClient from "./client";

export const getCart = async () => {
  const response = await apiClient.get("/orders/cart");
  return response.data;
};

export const addToCartRequest = async (payload) => {
  const response = await apiClient.post("/orders/cart", payload);
  return response.data;
};

export const updateCartItemRequest = async (menuItemId, payload) => {
  const response = await apiClient.put(`/orders/cart/${menuItemId}`, payload);
  return response.data;
};

export const removeCartItemRequest = async (menuItemId) => {
  const response = await apiClient.delete(`/orders/cart/${menuItemId}`);
  return response.data;
};

export const clearCartRequest = async () => {
  const response = await apiClient.delete("/orders/cart");
  return response.data;
};

export const placeOrder = async (payload) => {
  const response = await apiClient.post("/orders", payload);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await apiClient.get("/orders/my-orders");
  return response.data;
};

export const getAllOrders = async () => {
  const response = await apiClient.get("/orders");
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const updateOrder = async (id, payload) => {
  const response = await apiClient.put(`/orders/${id}`, payload);
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await apiClient.delete(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const response = await apiClient.patch(`/orders/${id}/status`, {
    orderStatus,
  });
  return response.data;
};