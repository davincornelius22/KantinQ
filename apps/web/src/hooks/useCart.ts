import { useState, useCallback, useMemo } from "react";
import { MenuItem } from "@kantinq/shared";
import { useLocalStorage } from "./useLocalStorage";

export interface CartItem {
  menu: MenuItem;
  quantity: number;
}

const CART_STORAGE_KEY = "kantinq_cart";

export function useCart(canteenId: number) {
  const [cart, setCart] = useLocalStorage<CartItem[]>(
    `${CART_STORAGE_KEY}_${canteenId}`,
    []
  );

  const addToCart = useCallback((menu: MenuItem) => {
    if (!menu.IsAvailable) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.menu.Id === menu.Id);
      if (existing) {
        return prev.map((item) =>
          item.menu.Id === menu.Id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menu, quantity: 1 }];
    });
  }, [setCart]);

  const updateQuantity = useCallback((menuId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menu.Id === menuId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, [setCart]);

  const removeFromCart = useCallback((menuId: number) => {
    setCart((prev) => prev.filter((item) => item.menu.Id !== menuId));
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.menu.Price * item.quantity, 0),
    [cart]
  );

  const totalItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartQuantities = useMemo(
    () =>
      cart.reduce<Record<number, number>>((acc, item) => {
        acc[item.menu.Id] = item.quantity;
        return acc;
      }, {}),
    [cart]
  );

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItemsCount,
    cartQuantities,
  };
}
