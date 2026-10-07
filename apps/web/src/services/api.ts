import {
  Canteen,
  MenuItem,
  OrderResponse,
  DashboardResponse,
  QueueResponse,
  OrderStatus,
  QueueCondition,
  CreateOrderDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  UpdateCanteenDto,
} from "@kantinq/shared";

const API_BASE = "/api";

// Fallback initial state jika backend belum dinyalakan saat demo
const fallbackCanteen: Canteen = {
  Id: 1,
  Name: "Kantin Barokah Mbok Darmi",
  Location: "Gedung Kuliah Bersama Lt. 1",
  Description:
    "Menyediakan aneka masakan nusantara, ayam geprek, nasi goreng, dan aneka minuman segar.",
  IsActive: true,
  CreatedAt: new Date().toISOString(),
};

const fallbackMenus: MenuItem[] = [
  {
    Id: 1,
    CanteenId: 1,
    Name: "Nasi Ayam Geprek Sambal Bawang",
    Description:
      "Ayam krispi digeprek dengan sambal bawang pedas nampol lengkap dengan nasi hangat dan lalapan.",
    Price: 18000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 2,
    CanteenId: 1,
    Name: "Nasi Goreng Spesial Telur",
    Description:
      "Nasi goreng bumbu racikan khas dengan telur ceplok/dadar, acar, dan kerupuk renyah.",
    Price: 15000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 3,
    CanteenId: 1,
    Name: "Mie Goreng Jawa",
    Description:
      "Mie kuning goreng dengan suwiran ayam, sawi hijau, kol, dan bumbu rempah manis gurih.",
    Price: 13000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 4,
    CanteenId: 1,
    Name: "Soto Ayam Lamongan + Nasi",
    Description:
      "Kuah kuning gurih beraroma koya, suwiran ayam, soun, telur rebus, dan nasi putih terpisah.",
    Price: 16000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 5,
    CanteenId: 1,
    Name: "Es Teh Manis Jumbo",
    Description: "Teh melati seduh segar manis dingin porsi gelas jumbo.",
    Price: 4000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 6,
    CanteenId: 1,
    Name: "Es Jeruk Peras Segar",
    Description: "Perasan jeruk asli pilihan kaya vitamin C dengan es batu.",
    Price: 5000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 7,
    CanteenId: 1,
    Name: "Kopi Susu Gula Aren",
    Description: "Espresso robusta berpadu susu segar dan gula aren alami.",
    Price: 8000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
  {
    Id: 8,
    CanteenId: 1,
    Name: "Air Mineral Botol 600ml",
    Description: "Air mineral higienis dingin atau biasa.",
    Price: 4000,
    IsAvailable: true,
    CreatedAt: new Date().toISOString(),
  },
];

let fallbackOrders: OrderResponse[] = [
  {
    Id: 1,
    CanteenId: 1,
    QueueNumber: "A-001",
    CustomerName: "Budi Santoso",
    TotalAmount: 22000,
    Status: OrderStatus.WAITING,
    CreatedAt: new Date().toISOString(),
    CompletedAt: null,
    OrderItems: [
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
    ],
  },
  {
    Id: 2,
    CanteenId: 1,
    QueueNumber: "A-002",
    CustomerName: "Siti Rahma",
    TotalAmount: 21000,
    Status: OrderStatus.PROCESSING,
    CreatedAt: new Date().toISOString(),
    CompletedAt: null,
    OrderItems: [
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
    ],
  },
  {
    Id: 3,
    CanteenId: 1,
    QueueNumber: "A-003",
    CustomerName: "Andi Pratama",
    TotalAmount: 38000,
    Status: OrderStatus.READY,
    CreatedAt: new Date().toISOString(),
    CompletedAt: null,
    OrderItems: [
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
    ],
  },
  {
    Id: 4,
    CanteenId: 1,
    QueueNumber: "A-004",
    CustomerName: "Dewi Lestari",
    TotalAmount: 21000,
    Status: OrderStatus.COMPLETED,
    CreatedAt: new Date().toISOString(),
    CompletedAt: new Date().toISOString(),
    OrderItems: [
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
  },
];

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.Message || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const ApiClient = {
  async getCanteens(): Promise<Canteen[]> {
    try {
      return await fetchJson<Canteen[]>(`${API_BASE}/canteens`);
    } catch {
      return [fallbackCanteen];
    }
  },

  async getCanteenById(id: number): Promise<Canteen> {
    try {
      return await fetchJson<Canteen>(`${API_BASE}/canteens/${id}`);
    } catch {
      return fallbackCanteen;
    }
  },

  async updateCanteen(id: number, dto: UpdateCanteenDto): Promise<Canteen> {
    try {
      return await fetchJson<Canteen>(`${API_BASE}/canteens/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      });
    } catch {
      Object.assign(fallbackCanteen, dto);
      return fallbackCanteen;
    }
  },

  async getMenu(canteenId: number): Promise<MenuItem[]> {
    try {
      return await fetchJson<MenuItem[]>(`${API_BASE}/canteens/${canteenId}/menu`);
    } catch {
      return fallbackMenus;
    }
  },

  async createMenuItem(canteenId: number, dto: CreateMenuItemDto): Promise<MenuItem> {
    try {
      return await fetchJson<MenuItem>(`${API_BASE}/canteens/${canteenId}/menu`, {
        method: "POST",
        body: JSON.stringify(dto),
      });
    } catch {
      const newItem: MenuItem = {
        Id: Date.now(),
        CanteenId: canteenId,
        Name: dto.Name,
        Description: dto.Description ?? null,
        Price: dto.Price,
        IsAvailable: dto.IsAvailable ?? true,
        CreatedAt: new Date().toISOString(),
      };
      fallbackMenus.push(newItem);
      return newItem;
    }
  },

  async updateMenuItem(id: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    try {
      return await fetchJson<MenuItem>(`${API_BASE}/menu/${id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      });
    } catch {
      const item = fallbackMenus.find((m) => m.Id === id);
      if (item) Object.assign(item, dto);
      return item || fallbackMenus[0];
    }
  },

  async deleteMenuItem(id: number): Promise<void> {
    try {
      await fetchJson(`${API_BASE}/menu/${id}`, { method: "DELETE" });
    } catch {
      const index = fallbackMenus.findIndex((m) => m.Id === id);
      if (index !== -1) fallbackMenus.splice(index, 1);
    }
  },

  async toggleMenuAvailability(id: number, isAvailable: boolean): Promise<MenuItem> {
    try {
      return await fetchJson<MenuItem>(`${API_BASE}/menu/${id}/availability`, {
        method: "PUT",
        body: JSON.stringify({ IsAvailable: isAvailable }),
      });
    } catch {
      const item = fallbackMenus.find((m) => m.Id === id);
      if (item) item.IsAvailable = isAvailable;
      return item || fallbackMenus[0];
    }
  },

  async createOrder(canteenId: number, dto: CreateOrderDto): Promise<OrderResponse> {
    try {
      return await fetchJson<OrderResponse>(`${API_BASE}/canteens/${canteenId}/orders`, {
        method: "POST",
        body: JSON.stringify(dto),
      });
    } catch {
      const nextNum = fallbackOrders.length + 1;
      const queueNumber = `A-${String(nextNum).padStart(3, "0")}`;

      const items = dto.Items.map((item, idx) => {
        const m = fallbackMenus.find((menu) => menu.Id === item.MenuItemId) || fallbackMenus[0];
        return {
          Id: Date.now() + idx,
          OrderId: nextNum,
          MenuItemId: m.Id,
          MenuItemName: m.Name,
          Price: m.Price,
          Quantity: item.Quantity,
          Subtotal: m.Price * item.Quantity,
        };
      });

      const totalAmount = items.reduce((sum, i) => sum + i.Subtotal, 0);

      const newOrder: OrderResponse = {
        Id: nextNum,
        CanteenId: canteenId,
        QueueNumber: queueNumber,
        CustomerName: dto.CustomerName,
        TotalAmount: totalAmount,
        Status: OrderStatus.WAITING,
        CreatedAt: new Date().toISOString(),
        CompletedAt: null,
        OrderItems: items,
      };

      fallbackOrders.push(newOrder);
      return newOrder;
    }
  },

  async getOrderById(id: number): Promise<OrderResponse> {
    try {
      return await fetchJson<OrderResponse>(`${API_BASE}/orders/${id}`);
    } catch {
      return fallbackOrders.find((o) => o.Id === id) || fallbackOrders[0];
    }
  },

  async getActiveOrders(canteenId: number): Promise<OrderResponse[]> {
    try {
      return await fetchJson<OrderResponse[]>(`${API_BASE}/canteens/${canteenId}/orders`);
    } catch {
      const active = [OrderStatus.WAITING, OrderStatus.PROCESSING, OrderStatus.READY];
      return fallbackOrders.filter((o) => active.includes(o.Status));
    }
  },

  async getOrderHistory(canteenId: number): Promise<OrderResponse[]> {
    try {
      return await fetchJson<OrderResponse[]>(
        `${API_BASE}/canteens/${canteenId}/order-history`
      );
    } catch {
      const history = [OrderStatus.COMPLETED, OrderStatus.CANCELLED];
      return fallbackOrders.filter((o) => history.includes(o.Status));
    }
  },

  async updateOrderStatus(id: number, status: OrderStatus): Promise<OrderResponse> {
    try {
      return await fetchJson<OrderResponse>(`${API_BASE}/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ Status: status }),
      });
    } catch {
      const order = fallbackOrders.find((o) => o.Id === id);
      if (order) {
        order.Status = status;
        if (status === OrderStatus.COMPLETED) {
          order.CompletedAt = new Date().toISOString();
        }
      }
      return order || fallbackOrders[0];
    }
  },

  async getQueue(canteenId: number): Promise<QueueResponse> {
    try {
      return await fetchJson<QueueResponse>(`${API_BASE}/canteens/${canteenId}/queue`);
    } catch {
      const active = fallbackOrders.filter((o) =>
        [OrderStatus.WAITING, OrderStatus.PROCESSING, OrderStatus.READY].includes(o.Status)
      );

      const condition =
        active.length <= 5
          ? QueueCondition.SEPI
          : active.length <= 15
          ? QueueCondition.SEDANG
          : QueueCondition.RAMAI;

      return {
        CanteenId: canteenId,
        CanteenName: fallbackCanteen.Name,
        Condition: condition,
        ActiveCount: active.length,
        WaitingCount: active.filter((o) => o.Status === OrderStatus.WAITING).length,
        ProcessingCount: active.filter((o) => o.Status === OrderStatus.PROCESSING).length,
        ReadyCount: active.filter((o) => o.Status === OrderStatus.READY).length,
        QueueList: active,
      };
    }
  },

  async getDashboard(canteenId: number): Promise<DashboardResponse> {
    try {
      return await fetchJson<DashboardResponse>(
        `${API_BASE}/canteens/${canteenId}/dashboard`
      );
    } catch {
      const active = fallbackOrders.filter((o) =>
        [OrderStatus.WAITING, OrderStatus.PROCESSING, OrderStatus.READY].includes(o.Status)
      );
      const completed = fallbackOrders.filter((o) => o.Status === OrderStatus.COMPLETED);

      const condition =
        active.length <= 5
          ? QueueCondition.SEPI
          : active.length <= 15
          ? QueueCondition.SEDANG
          : QueueCondition.RAMAI;

      return {
        TotalOrdersToday: fallbackOrders.length,
        WaitingOrders: active.filter((o) => o.Status === OrderStatus.WAITING).length,
        ProcessingOrders: active.filter((o) => o.Status === OrderStatus.PROCESSING).length,
        ReadyOrders: active.filter((o) => o.Status === OrderStatus.READY).length,
        CompletedOrders: completed.length,
        TotalRevenueToday: completed.reduce((sum, o) => sum + o.TotalAmount, 0),
        QueueCondition: condition,
        ActiveOrders: active,
      };
    }
  },

  async getQr(canteenId: number): Promise<{ TargetUrl: string; QrCodeDataUrl: string }> {
    try {
      return await fetchJson<{ TargetUrl: string; QrCodeDataUrl: string }>(
        `${API_BASE}/canteens/${canteenId}/qr`
      );
    } catch {
      const url = `${window.location.origin}/?canteenId=${canteenId}`;
      return {
        TargetUrl: url,
        QrCodeDataUrl: "",
      };
    }
  },
};
