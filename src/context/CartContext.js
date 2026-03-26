import { createContext, useEffect, useState } from "react";

import {
  addToCartRequest,
  clearCartRequest,
  getCart,
  removeCartItemRequest,
  updateCartItemRequest,
} from "../api/orderApi";
import { extractErrorMessage } from "../utils/helpers";
import { useAuth } from "../hooks/useAuth";

export const CartContext = createContext(null);

const emptyCart = {
  items: [],
  totalItems: 0,
  itemsPrice: 0,
  deliveryCharge: 0,
  totalPrice: 0,
};

export function CartProvider({ children }) {
  const { token, user } = useAuth();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user?.role !== "admin") {
      refreshCart().catch(() => {
        setCart(emptyCart);
      });
      return;
    }

    setCart(emptyCart);
  }, [token, user?.role]);

  const refreshCart = async () => {
    if (!token) {
      setCart(emptyCart);
      return emptyCart;
    }

    try {
      setLoading(true);
      const data = await getCart();
      setCart(data.cart);
      return data.cart;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to load cart"));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (menuItemId, quantity = 1) => {
    try {
      setLoading(true);
      const data = await addToCartRequest({ menuItemId, quantity });
      setCart(data.cart);
      return data.cart;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to add item to cart"));
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (menuItemId, quantity) => {
    try {
      setLoading(true);
      const data = await updateCartItemRequest(menuItemId, { quantity });
      setCart(data.cart);
      return data.cart;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to update cart item"));
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (menuItemId) => {
    try {
      setLoading(true);
      const data = await removeCartItemRequest(menuItemId);
      setCart(data.cart);
      return data.cart;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to remove cart item"));
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const data = await clearCartRequest();
      setCart(data.cart);
      return data.cart;
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Failed to clear cart"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
