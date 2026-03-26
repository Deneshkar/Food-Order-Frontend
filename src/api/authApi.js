import apiClient from "./client";

export const loginUser = async (payload) => {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
};

export const registerUser = async (payload) => {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
};

export const getMyProfile = async () => {
  const response = await apiClient.get("/users/profile");
  return response.data;
};
