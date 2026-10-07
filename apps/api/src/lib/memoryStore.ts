import {
  Canteen,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
} from "@kantinq/shared";

interface InMemoryState {
  canteens: Canteen[];
  menuItems: MenuItem[];
  orders: Order[];
  orderItems: OrderItem[];
  nextCanteenId: number;
  nextMenuItemId: number;
  nextOrderId: number;
  nextOrderItemId: number;
}

export const memoryStore: InMemoryState = {
  canteens: [
    {
      Id: 1,
      Name: "Kantin Barokah Mbok Darmi",
      Location: "Gedung Kuliah Bersama Lt. 1",
      Description:
        "Menyediakan aneka masakan nusantara, ayam geprek, nasi goreng, dan aneka minuman segar.",
      IsActive: true,
      CreatedAt: new Date(),
    },
  ],
  menuItems: [
    {
      Id: 1,
      CanteenId: 1,
      Name: "Nasi Ayam Geprek Sambal Bawang",
      Description:
        "Ayam krispi digeprek dengan sambal bawang pedas nampol lengkap dengan nasi hangat dan lalapan.",
      Price: 18000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
    {
      Id: 2,
      CanteenId: 1,
      Name: "Nasi Goreng Spesial Telur",
      Description:
        "Nasi goreng bumbu racikan khas dengan telur ceplok/dadar, acar, dan kerupuk renyah.",
      Price: 15000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
    {
      Id: 3,
      CanteenId: 1,
      Name: "Mie Goreng Jawa",
      Description:
        "Mie kuning goreng dengan suwiran ayam, sawi hijau, kol, dan bumbu rempah manis gurih.",
      Price: 13000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
    {
      Id: 4,
      CanteenId: 1,
      Name: "Soto Ayam Lamongan + Nasi",
      Description:
        "Kuah kuning gurih beraroma koya, suwiran ayam, soun, telur rebus, dan nasi putih terpisah.",
      Price: 16000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
    {
      Id: 5,
      CanteenId: 1,
      Name: "Es Teh Manis Jumbo",
      Description: "Teh melati seduh segar manis dingin porsi gelas jumbo.",
      Price: 4000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
    {
      Id: 6,
      CanteenId: 1,
      Name: "Es Jeruk Peras Segar",
      Description: "Perasan jeruk asli pilihan kaya vitamin C dengan es batu.",
      Price: 5000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
    {
      Id: 7,
      CanteenId: 1,
      Name: "Kopi Susu Gula Aren",
      Description: "Espresso robusta berpadu susu segar dan gula aren alami.",
      Price: 8000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
    {
      Id: 8,
      CanteenId: 1,
      Name: "Air Mineral Botol 600ml",
      Description: "Air mineral higienis dingin atau biasa.",
      Price: 4000,
      IsAvailable: true,
      CreatedAt: new Date(),
    },
  ],
  orders: [
    {
      Id: 1,
      CanteenId: 1,
      QueueNumber: "A-001",
      CustomerName: "Budi Santoso",
      TotalAmount: 22000,
      Status: OrderStatus.WAITING,
      CreatedAt: new Date(),
      CompletedAt: null,
    },
    {
      Id: 2,
      CanteenId: 1,
      QueueNumber: "A-002",
      CustomerName: "Siti Rahma",
      TotalAmount: 21000,
      Status: OrderStatus.PROCESSING,
      CreatedAt: new Date(),
      CompletedAt: null,
    },
    {
      Id: 3,
      CanteenId: 1,
      QueueNumber: "A-003",
      CustomerName: "Andi Pratama",
      TotalAmount: 38000,
      Status: OrderStatus.READY,
      CreatedAt: new Date(),
      CompletedAt: null,
    },
    {
      Id: 4,
      CanteenId: 1,
      QueueNumber: "A-004",
      CustomerName: "Dewi Lestari",
      TotalAmount: 21000,
      Status: OrderStatus.COMPLETED,
      CreatedAt: new Date(),
      CompletedAt: new Date(),
    },
  ],
  orderItems: [
    {
      Id: 1,
      OrderId: 1,
      MenuItemId: 1,
      MenuItemName: "Nasi Ayam Geprek Sambal Bawang",
      Price: 18000,
      Quantity: 1,
      Subtotal: 18000,
    },
    {
      Id: 2,
      OrderId: 1,
      MenuItemId: 5,
      MenuItemName: "Es Teh Manis Jumbo",
      Price: 4000,
      Quantity: 1,
      Subtotal: 4000,
    },
    {
      Id: 3,
      OrderId: 2,
      MenuItemId: 4,
      MenuItemName: "Soto Ayam Lamongan + Nasi",
      Price: 16000,
      Quantity: 1,
      Subtotal: 16000,
    },
    {
      Id: 4,
      OrderId: 2,
      MenuItemId: 6,
      MenuItemName: "Es Jeruk Peras Segar",
      Price: 5000,
      Quantity: 1,
      Subtotal: 5000,
    },
    {
      Id: 5,
      OrderId: 3,
      MenuItemId: 2,
      MenuItemName: "Nasi Goreng Spesial Telur",
      Price: 15000,
      Quantity: 2,
      Subtotal: 30000,
    },
    {
      Id: 6,
      OrderId: 3,
      MenuItemId: 5,
      MenuItemName: "Es Teh Manis Jumbo",
      Price: 4000,
      Quantity: 2,
      Subtotal: 8000,
    },
    {
      Id: 7,
      OrderId: 4,
      MenuItemId: 3,
      MenuItemName: "Mie Goreng Jawa",
      Price: 13000,
      Quantity: 1,
      Subtotal: 13000,
    },
    {
      Id: 8,
      OrderId: 4,
      MenuItemId: 7,
      MenuItemName: "Kopi Susu Gula Aren",
      Price: 8000,
      Quantity: 1,
      Subtotal: 8000,
    },
  ],
  nextCanteenId: 2,
  nextMenuItemId: 9,
  nextOrderId: 5,
  nextOrderItemId: 9,
};
