import axios from "axios";

import { API_BASE_URL } from "../utils/constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

const getMimeType = (uri, fallback = "image/jpeg") => {
  if (!uri) {
    return fallback;
  }

  const extension = uri.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return fallback;
  }
};

export const buildImagePart = (image, fieldName = "image") => {
  if (!image?.uri) {
    return null;
  }

  const extension = image.uri.split(".").pop() || "jpg";

  return {
    uri: image.uri,
    name: `${fieldName}-${Date.now()}.${extension}`,
    type: image.mimeType || getMimeType(image.uri),
  };
};

export default apiClient;
