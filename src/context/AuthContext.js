/* eslint-disable react/prop-types */
import { createContext, useEffect, useMemo, useState } from "react";

import { getMyProfile, loginUser, registerUser } from "../api/authApi";
import { setAuthToken } from "../api/client";
import { API_BASE_URL } from "../utils/constants";
import { clearAuthData, getStoredToken, getStoredUser, saveAuthData } from "../utils/storage";
import { extractErrorMessage } from "../utils/helpers";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await getStoredToken();
      const storedUser = await getStoredUser();

      if (storedToken) {
        setAuthToken(storedToken);
        setToken(storedToken);
        if (storedUser) {
          setUser(storedUser);
        } else {
          try {
            const data = await getMyProfile();
            await saveAuthData(storedToken, data.user);
            setUser(data.user);
          } catch {
            await clearAuthData();
            setToken(null);
            setUser(null);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const persistSession = async (nextToken, nextUser) => {
    await saveAuthData(nextToken, nextUser);
    setAuthToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (payload) => {
    try {
      setAuthLoading(true);
      const data = await loginUser(payload);
      await persistSession(data.token, data.user);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Login failed"));
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    try {
      setAuthLoading(true);
      const data = await registerUser(payload);
      await persistSession(data.token, data.user);
      return data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Registration failed"));
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const data = await getMyProfile();
      if (token) {
        await saveAuthData(token, data.user);
      }
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load profile"));
    }
  };

  const updateCurrentUser = async (nextUser) => {
    if (token) {
      await saveAuthData(token, nextUser);
    }
    setUser(nextUser);
  };

  const logout = async () => {
    await clearAuthData();
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const contextValue = useMemo(
    () => ({
      token,
      user,
      loading,
      initializing: loading,
      authLoading,
      login,
      register,
      refreshProfile,
      updateCurrentUser,
      logout,
      API_BASE_URL,
    }),
    [token, user, loading, authLoading]
  );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}
