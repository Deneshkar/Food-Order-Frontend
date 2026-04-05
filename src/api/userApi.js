import apiClient, { buildImagePart } from "./client";

const buildProfileFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value === "undefined" || value === null || value === "") {
      return;
    }

    if (key === "profileImage") {
      const imagePart = buildImagePart(value, "profile");

      if (imagePart) {
        formData.append("profileImage", imagePart);
      }

      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const createUserByAdmin = async (payload) => {
  const response = await apiClient.post("/users", buildProfileFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await apiClient.put(
    "/users/profile",
    buildProfileFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getAllUsers = async (params = {}) => {
  const response = await apiClient.get("/users", { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const updateUserByAdmin = async (id, payload) => {
  const response = await apiClient.put(
    `/users/${id}`,
    buildProfileFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const changeUserRole = async (id, role) => {
  const response = await apiClient.patch(`/users/${id}/role`, { role });
  return response.data;
};

export const deleteUserByAdmin = async (id) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};