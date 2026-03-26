import apiClient from "./client";

export const getCategories = async () => {
  const response = await apiClient.get("/categories");
  return response.data;
};

export const createCategory = async (payload) => {
  const response = await apiClient.post("/categories", payload);
  return response.data;
};

export const updateCategory = async (id, payload) => {
  const response = await apiClient.put(`/categories/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`/categories/${id}`);
  return response.data;
};
