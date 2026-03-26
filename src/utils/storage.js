import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "food_order_token";
const USER_KEY = "food_order_user";

export const saveAuthData = async (token, user) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
};

export const getStoredToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = async () => {
  const user = await AsyncStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearAuthData = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};
