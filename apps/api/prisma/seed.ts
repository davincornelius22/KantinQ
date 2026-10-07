import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Memulai proses seeding data KantinQ...");

  // Hapus data lama jika ada
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.canteen.deleteMany();

  // 1. Buat Kantin
  const canteen = await prisma.canteen.create({
    data: {
      Name: "Kantin Barokah Mbok Darmi",
      Location: "Gedung Kuliah Bersama Lt. 1",
      Description: "Menyediakan aneka masakan nusantara, ayam geprek, nasi goreng, dan aneka minuman segar.",
      IsActive: true,
    },
  });

  console.log(`Kantin dibuat: ${canteen.Name} (ID: ${canteen.Id})`);

  // 2. Buat Menu Items
  const menuData = [
    {
      Name: "Nasi Ayam Geprek Sambal Bawang",
      Description: "Ayam krispi digeprek dengan sambal bawang pedas nampol lengkap dengan nasi hangat dan lalapan.",
      Price: 18000,
      IsAvailable: true,
    },
    {
      Name: "Nasi Goreng Spesial Telur",
      Description: "Nasi goreng bumbu racikan khas dengan telur ceplok/dadar, acar, dan kerupuk renyah.",
      Price: 15000,
      IsAvailable: true,
    },
    {
      Name: "Mie Goreng Jawa",
      Description: "Mie kuning goreng dengan suwiran ayam, sawi hijau, kol, dan bumbu rempah manis gurih.",
      Price: 13000,
      IsAvailable: true,
    },
    {
      Name: "Soto Ayam Lamongan + Nasi",
      Description: "Kuah kuning gurih beraroma koya, suwiran ayam, soun, telur rebus, dan nasi putih terpisah.",
      Price: 16000,
      IsAvailable: true,
    },
    {
      Name: "Es Teh Manis Jumbo",
      Description: "Teh melati seduh segar manis dingin porsi gelas jumbo.",
      Price: 4000,
      IsAvailable: true,
    },
    {
      Name: "Es Jeruk Peras Segar",
      Description: "Perasan jeruk asli pilihan kaya vitamin C dengan es batu.",
      Price: 5000,
      IsAvailable: true,
    },
    {
      Name: "Kopi Susu Gula Aren",
      Description: "Espresso robusta berpadu susu segar dan gula aren alami.",
      Price: 8000,
      IsAvailable: true,
    },
    {
      Name: "Air Mineral Botol 600ml",
      Description: "Air mineral higienis dingin atau biasa.",
      Price: 4000,
      IsAvailable: true,
    },
  ];

  const createdMenus = [];
  for (const m of menuData) {
    const created = await prisma.menuItem.create({
      data: {
        ...m,
        CanteenId: canteen.Id,
      },
    });
    createdMenus.push(created);
  }

  console.log(`${createdMenus.length} menu berhasil ditambahkan.`);

  // 3. Buat Contoh Pesanan
  // Order 1: WAITING
  const order1 = await prisma.order.create({
    data: {
      CanteenId: canteen.Id,
      QueueNumber: "A-001",
      CustomerName: "Budi Santoso",
      TotalAmount: 22000,
      Status: "WAITING",
      OrderItems: {
        create: [
          {
            MenuItemId: createdMenus[0].Id,
            MenuItemName: createdMenus[0].Name,
            Price: createdMenus[0].Price,
            Quantity: 1,
            Subtotal: 18000,
          },
          {
            MenuItemId: createdMenus[4].Id,
            MenuItemName: createdMenus[4].Name,
            Price: createdMenus[4].Price,
            Quantity: 1,
            Subtotal: 4000,
          },
        ],
      },
    },
  });

  // Order 2: PROCESSING
  const order2 = await prisma.order.create({
    data: {
      CanteenId: canteen.Id,
      QueueNumber: "A-002",
      CustomerName: "Siti Rahma",
      TotalAmount: 21000,
      Status: "PROCESSING",
      OrderItems: {
        create: [
          {
            MenuItemId: createdMenus[3].Id,
            MenuItemName: createdMenus[3].Name,
            Price: createdMenus[3].Price,
            Quantity: 1,
            Subtotal: 16000,
          },
          {
            MenuItemId: createdMenus[5].Id,
            MenuItemName: createdMenus[5].Name,
            Price: createdMenus[5].Price,
            Quantity: 1,
            Subtotal: 5000,
          },
        ],
      },
    },
  });

  // Order 3: READY
  const order3 = await prisma.order.create({
    data: {
      CanteenId: canteen.Id,
      QueueNumber: "A-003",
      CustomerName: "Andi Pratama",
      TotalAmount: 38000,
      Status: "READY",
      OrderItems: {
        create: [
          {
            MenuItemId: createdMenus[1].Id,
            MenuItemName: createdMenus[1].Name,
            Price: createdMenus[1].Price,
            Quantity: 2,
            Subtotal: 30000,
          },
          {
            MenuItemId: createdMenus[4].Id,
            MenuItemName: createdMenus[4].Name,
            Price: createdMenus[4].Price,
            Quantity: 2,
            Subtotal: 8000,
          },
        ],
      },
    },
  });

  // Order 4: COMPLETED
  const order4 = await prisma.order.create({
    data: {
      CanteenId: canteen.Id,
      QueueNumber: "A-004",
      CustomerName: "Dewi Lestari",
      TotalAmount: 21000,
      Status: "COMPLETED",
      CompletedAt: new Date(),
      OrderItems: {
        create: [
          {
            MenuItemId: createdMenus[2].Id,
            MenuItemName: createdMenus[2].Name,
            Price: createdMenus[2].Price,
            Quantity: 1,
            Subtotal: 13000,
          },
          {
            MenuItemId: createdMenus[6].Id,
            MenuItemName: createdMenus[6].Name,
            Price: createdMenus[6].Price,
            Quantity: 1,
            Subtotal: 8000,
          },
        ],
      },
    },
  });

  console.log("Data pesanan sample berhasil dibuat.");
  console.log("Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
