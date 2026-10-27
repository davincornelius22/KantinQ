import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCart } from "../hooks/useCart";
import { MenuItem } from "@kantinq/shared";

const mockMenu1: MenuItem = {
  Id: 101,
  CanteenId: 1,
  Name: "Nasi Ayam Geprek",
  Description: "Pedas gurih",
  Price: 18000,
  IsAvailable: true,
  CreatedAt: new Date().toISOString(),
};

const mockMenu2: MenuItem = {
  Id: 102,
  CanteenId: 1,
  Name: "Es Teh Manis",
  Description: "Dingin segar",
  Price: 4000,
  IsAvailable: true,
  CreatedAt: new Date().toISOString(),
};

const unavailableMenu: MenuItem = {
  Id: 103,
  CanteenId: 1,
  Name: "Menu Habis",
  Description: "Stok habis",
  Price: 10000,
  IsAvailable: false,
  CreatedAt: new Date().toISOString(),
};

describe("useCart Hook", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("should initialize with an empty cart and 0 totals", () => {
    const { result } = renderHook(() => useCart(1));
    expect(result.current.cart).toEqual([]);
    expect(result.current.totalAmount).toBe(0);
    expect(result.current.totalItemsCount).toBe(0);
  });

  it("should add available item to cart", () => {
    const { result } = renderHook(() => useCart(1));

    act(() => {
      result.current.addToCart(mockMenu1);
    });

    expect(result.current.cart.length).toBe(1);
    expect(result.current.cart[0].menu.Id).toBe(101);
    expect(result.current.cart[0].quantity).toBe(1);
    expect(result.current.totalAmount).toBe(18000);
    expect(result.current.totalItemsCount).toBe(1);
    expect(result.current.cartQuantities[101]).toBe(1);
  });

  it("should not add out-of-stock item to cart", () => {
    const { result } = renderHook(() => useCart(1));

    act(() => {
      result.current.addToCart(unavailableMenu);
    });

    expect(result.current.cart.length).toBe(0);
    expect(result.current.totalItemsCount).toBe(0);
  });

  it("should increment quantity when adding the same item twice", () => {
    const { result } = renderHook(() => useCart(1));

    act(() => {
      result.current.addToCart(mockMenu1);
      result.current.addToCart(mockMenu1);
    });

    expect(result.current.cart.length).toBe(1);
    expect(result.current.cart[0].quantity).toBe(2);
    expect(result.current.totalAmount).toBe(36000);
    expect(result.current.totalItemsCount).toBe(2);
  });

  it("should handle multiple distinct items and calculate correct grand total", () => {
    const { result } = renderHook(() => useCart(1));

    act(() => {
      result.current.addToCart(mockMenu1); // 18000
      result.current.addToCart(mockMenu2); // 4000
      result.current.addToCart(mockMenu2); // 4000
    });

    expect(result.current.cart.length).toBe(2);
    expect(result.current.totalItemsCount).toBe(3);
    expect(result.current.totalAmount).toBe(26000); // 18000 + 8000
  });

  it("should update quantity with delta and remove item if quantity reaches 0", () => {
    const { result } = renderHook(() => useCart(1));

    act(() => {
      result.current.addToCart(mockMenu1);
      result.current.addToCart(mockMenu1); // qty 2
    });

    act(() => {
      result.current.updateQuantity(mockMenu1.Id, -1);
    });
    expect(result.current.cart[0].quantity).toBe(1);

    act(() => {
      result.current.updateQuantity(mockMenu1.Id, -1);
    });
    expect(result.current.cart.length).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it("should explicitly remove item from cart", () => {
    const { result } = renderHook(() => useCart(1));

    act(() => {
      result.current.addToCart(mockMenu1);
      result.current.addToCart(mockMenu2);
    });

    act(() => {
      result.current.removeFromCart(mockMenu1.Id);
    });

    expect(result.current.cart.length).toBe(1);
    expect(result.current.cart[0].menu.Id).toBe(mockMenu2.Id);
    expect(result.current.totalAmount).toBe(4000);
  });

  it("should clear the entire cart", () => {
    const { result } = renderHook(() => useCart(1));

    act(() => {
      result.current.addToCart(mockMenu1);
      result.current.addToCart(mockMenu2);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart.length).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });
});
