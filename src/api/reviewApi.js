import apiClient from "./client";

export const addReview = async (payload) => {
  const response = await apiClient.post("/reviews", payload);
  return response.data;
};

export const getMenuItemReviews = async (menuItemId) => {
  const response = await apiClient.get(`/reviews/menu/${menuItemId}`);
  return response.data;
};

export const getMyReviews = async () => {
  const response = await apiClient.get("/reviews/my-reviews");
  return response.data;
};

export const updateReview = async (id, payload) => {
  const response = await apiClient.put(`/reviews/${id}`, payload);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await apiClient.delete(`/reviews/${id}`);
  return response.data;
};
