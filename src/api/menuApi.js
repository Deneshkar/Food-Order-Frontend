import apiClient, { buildImagePart } from "./client";

const buildMenuFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value === "undefined" || value === null || value === "") {
      return;
    }

    if (key === "image") {
      const imagePart = buildImagePart(value, "menu");

      if (imagePart) {
        formData.append("image", imagePart);
      }

      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export const getMenuItems = async (params = {}) => {
  const response = await apiClient.get("/menu", { params });
  return response.data;
};

export const getMenuItemById = async (id) => {
  const response = await apiClient.get(`/menu/${id}`);
  return response.data;
};

export const createMenuItem = async (payload) => {
  const response = await apiClient.post("/menu", buildMenuFormData(payload), {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateMenuItem = async (id, payload) => {
  const response = await apiClient.put(
    `/menu/${id}`,
    buildMenuFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await apiClient.delete(`/menu/${id}`);
  return response.data;
};
