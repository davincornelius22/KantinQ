import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCart } from "../hooks/useCart";
import { MAX_ITEM_QUANTITY } from "../utils/validation";
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

const mockMenu3: MenuItem = {
  Id: 104,
  CanteenId: 1,
  Name: "Soto Ayam",
  Description: "Kuah hangat",
  Price: 16000,
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
    expect(result.current.cartQuantities).toEqual({});
  });

  it("should restore cart from localStorage on initialization", () => {
    window.localStorage.setItem(
      "kantinq_cart_1",
      JSON.stringify([{ menu: mockMenu1, quantity: 3 }])
    );
    const { result } = renderHook(() => useCart(1));
    expect(result.current.cart.length).toBe(1);
    expect(result.current.totalItemsCount).toBe(3);
    expect(result.current.totalAmount).toBe(54000);
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
  });

  describe("Quantity Cap (max 20 portions per item)", () => {
    it("should cap quantity at 20 when addToCart is called 25 times", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        for (let i = 0; i < 25; i++) {
          result.current.addToCart(mockMenu1);
        }
      });

      expect(result.current.cart[0].quantity).toBe(MAX_ITEM_QUANTITY);
      expect(result.current.totalItemsCount).toBe(20);
      expect(result.current.totalAmount).toBe(18000 * 20);
    });

    it("should cap quantity at 20 when updateQuantity exceeds limit", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu2);
      });
      act(() => {
        result.current.updateQuantity(mockMenu2.Id, 50);
      });

      expect(result.current.cart[0].quantity).toBe(20);
      expect(result.current.totalAmount).toBe(80000);
    });

    it("should allow decrementing from max quantity 20 down to 19", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.updateQuantity(mockMenu1.Id, 19);
      });
      expect(result.current.cart[0].quantity).toBe(20);

      act(() => {
        result.current.updateQuantity(mockMenu1.Id, -1);
      });
      expect(result.current.cart[0].quantity).toBe(19);
    });

    it("should cap each distinct menu item independently at 20", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
        result.current.addToCart(mockMenu2);
      });
      act(() => {
        result.current.updateQuantity(mockMenu1.Id, 25);
        result.current.updateQuantity(mockMenu2.Id, 25);
      });

      expect(result.current.cartQuantities[mockMenu1.Id]).toBe(20);
      expect(result.current.cartQuantities[mockMenu2.Id]).toBe(20);
      expect(result.current.totalItemsCount).toBe(40);
    });

    it.each([
      [1, 5, 6],
      [1, 19, 20],
      [1, 20, 20],
      [10, 10, 20],
      [15, 10, 20],
      [20, 1, 20],
      [20, -5, 15],
      [5, -3, 2],
    ])("starting at %i with delta %i yields %i", (initialQty, delta, expectedQty) => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu2);
      });
      if (initialQty > 1) {
        act(() => {
          result.current.updateQuantity(mockMenu2.Id, initialQty - 1);
        });
      }
      act(() => {
        result.current.updateQuantity(mockMenu2.Id, delta);
      });

      expect(result.current.cart[0].quantity).toBe(expectedQty);
    });
  });

  describe("Multi-item calculations", () => {
    it.each([
      [1, 0, 0, 18000, 1],
      [1, 2, 0, 26000, 3],
      [2, 3, 1, 64000, 6],
      [0, 5, 2, 52000, 7],
      [3, 3, 3, 114000, 9],
      [20, 20, 0, 440000, 40],
    ])(
      "calculates totals for qty (%i, %i, %i) -> Rp %i (%i items)",
      (q1, q2, q3, expectedAmount, expectedCount) => {
        const { result } = renderHook(() => useCart(1));

        act(() => {
          for (let i = 0; i < q1; i++) result.current.addToCart(mockMenu1);
          for (let i = 0; i < q2; i++) result.current.addToCart(mockMenu2);
          for (let i = 0; i < q3; i++) result.current.addToCart(mockMenu3);
        });

        expect(result.current.totalAmount).toBe(expectedAmount);
        expect(result.current.totalItemsCount).toBe(expectedCount);
      }
    );
  });

  describe("updateQuantity removal & edge cases", () => {
    it("should remove item if quantity reaches 0", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.updateQuantity(mockMenu1.Id, -1);
      });
      expect(result.current.cart[0].quantity).toBe(1);

      act(() => {
        result.current.updateQuantity(mockMenu1.Id, -1);
      });
      expect(result.current.cart.length).toBe(0);
    });

    it("should remove item if negative delta pushes quantity below 0", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.updateQuantity(mockMenu1.Id, -10);
      });
      expect(result.current.cart.length).toBe(0);
    });

    it("should be a no-op when updating a non-existent menuId", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.updateQuantity(9999, 1);
      });
      expect(result.current.cart.length).toBe(1);
      expect(result.current.cart[0].quantity).toBe(1);
    });
  });

  describe("removeFromCart & clearCart", () => {
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
    });

    it("should keep cart unchanged when removing non-existent ID", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.removeFromCart(9999);
      });

      expect(result.current.cart.length).toBe(1);
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

  describe("syncWithMenus & Canteen isolation", () => {
    it("should update item price when syncWithMenus receives fresh menu", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.syncWithMenus([{ ...mockMenu1, Price: 20000 }]);
      });

      expect(result.current.totalAmount).toBe(20000);
    });

    it("should update item availability to false on syncWithMenus", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.syncWithMenus([{ ...mockMenu1, IsAvailable: false }]);
      });

      expect(result.current.cart[0].menu.IsAvailable).toBe(false);
    });

    it("should restore item availability to true on syncWithMenus", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.syncWithMenus([{ ...mockMenu1, IsAvailable: false }]);
        result.current.syncWithMenus([{ ...mockMenu1, IsAvailable: true }]);
      });

      expect(result.current.cart[0].menu.IsAvailable).toBe(true);
    });

    it("should preserve cart item if not found in freshMenus", () => {
      const { result } = renderHook(() => useCart(1));

      act(() => {
        result.current.addToCart(mockMenu1);
      });
      act(() => {
        result.current.syncWithMenus([mockMenu2]);
      });

      expect(result.current.cart.length).toBe(1);
      expect(result.current.cart[0].menu.Id).toBe(mockMenu1.Id);
    });

    it("should isolate carts per canteenId", () => {
      const { result: cart1 } = renderHook(() => useCart(1));
      const { result: cart2 } = renderHook(() => useCart(2));

      act(() => {
        cart1.current.addToCart(mockMenu1);
      });

      expect(cart1.current.cart.length).toBe(1);
      expect(cart2.current.cart.length).toBe(0);
    });

    it("should persist separate localStorage keys per canteenId", () => {
      const { result: cart1 } = renderHook(() => useCart(1));
      const { result: cart2 } = renderHook(() => useCart(2));

      act(() => {
        cart1.current.addToCart(mockMenu1);
        cart2.current.addToCart(mockMenu2);
      });

      expect(window.localStorage.getItem("kantinq_cart_1")).toContain("Nasi Ayam Geprek");
      expect(window.localStorage.getItem("kantinq_cart_2")).toContain("Es Teh Manis");
    });
  });
});
