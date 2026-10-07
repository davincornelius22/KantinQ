# KantinQ - Project Specification

Build a simple full-stack web application named **KantinQ**.

Purpose:
Help students order food from a campus canteen digitally and reduce physical queues. Students scan a QR Code provided by the canteen, view available menu items, place an order, receive a digital queue number, and monitor the order status. Canteen staff can manage menus, incoming orders, and the digital queue.

The main workflow is:

```text
Scan QR
↓
Lihat Menu
↓
Pilih Pesanan
↓
Konfirmasi
↓
Nomor Antrean
↓
Pesanan Diproses
↓
Siap Diambil
↓
Selesai
```

The application is intended to address these problems:

* Long physical queues during busy hours.
* Manual ordering directly to the seller.
* Difficulty knowing the status of an order.
* Difficulty managing many simultaneous orders.
* Lack of simple information about current queue conditions.

Use this stack:

* Frontend: React + TypeScript + Vite + Tailwind CSS
* Backend: Node.js + TypeScript + Express
* Database: MySQL
* ORM: Prisma
* API style: REST API
* QR Code: QR Code for the canteen ordering page
* Use Docker Compose for MySQL
* Use `.env.example` for database URL

Code rules:

* Do not add comments unless truly necessary.
* Use PascalCase for all classes, types, interfaces, enums, React components, database models, API DTOs, and JSON property names.
* Local variables may use camelCase.
* Keep code lines below 150 characters where practical.
* Use a clean and simple folder structure.
* Do not add authentication in this first version.
* Assume one canteen operator uses the application.
* Payment is handled directly at the canteen and is not processed by the application.
* Keep the implementation simple and suitable for a university RPL project that can be completed in 12 meetings.

Main entities:

1. Canteen

   * Id
   * Name
   * Location
   * Description
   * IsActive
   * CreatedAt

2. MenuItem

   * Id
   * CanteenId
   * Name
   * Description
   * Price
   * IsAvailable
   * CreatedAt

3. Order

   * Id
   * CanteenId
   * QueueNumber
   * CustomerName
   * TotalAmount
   * Status
   * CreatedAt
   * CompletedAt

4. OrderItem

   * Id
   * OrderId
   * MenuItemId
   * MenuItemName
   * Price
   * Quantity
   * Subtotal

Order status:

* `WAITING`
* `PROCESSING`
* `READY`
* `COMPLETED`
* `CANCELLED`

Database rules:

* An Order must contain one or more OrderItem records.
* QueueNumber must be generated automatically for every new order.
* Queue numbers are generated separately for each canteen.
* Queue numbers reset at the start of each day.
* Completed and cancelled orders are not counted as active queue orders.
* OrderItem must store the menu item name and price at the time of ordering.
* Editing a menu item must not change previously created orders.
* Do not allow customers to order unavailable menu items.
* Do not allow zero or negative quantities.
* Calculate TotalAmount on the backend.
* Use Prisma migrations and seed one example canteen, several sample menu items, and sample orders.

Backend features:

1. CRUD Canteen

   * Create canteen.
   * List canteens.
   * Get canteen detail.
   * Update canteen.
   * Delete canteen.
   * Activate or deactivate a canteen.

2. CRUD MenuItem

   * Add menu item for a canteen.
   * List menu items.
   * Get menu item detail.
   * Update menu item.
   * Delete menu item.
   * Change menu availability.

3. Order Management

   * Create a new order.
   * Generate queue number automatically.
   * Calculate order total.
   * Store order items.
   * Get order detail.
   * List active orders.
   * List order history.
   * Update order status.

4. Digital Queue

   * Show active queue for a canteen.
   * Show waiting, processing, and ready orders.
   * Remove completed and cancelled orders from the active queue.
   * Show queue condition based on active orders:
     * `SEPI`: 0-5 active orders
     * `SEDANG`: 6-15 active orders
     * `RAMAI`: 16 or more active orders

5. Dashboard API

   * Return a canteen summary:

     * TotalOrdersToday
     * WaitingOrders
     * ProcessingOrders
     * ReadyOrders
     * CompletedOrders
     * TotalRevenueToday

   * Return active queue data:

     * OrderId
     * QueueNumber
     * CustomerName
     * TotalAmount
     * Status
     * CreatedAt

6. QR Code

   * Generate the ordering URL for a canteen.
   * Generate a QR Code for the ordering page.
   * Scanning the QR Code must open the correct canteen ordering page.

Frontend pages:

1. Customer Ordering Page

   * Opened from the canteen QR Code.
   * Show canteen name and location.
   * Show available menu items.
   * Show unavailable menu items as disabled.
   * Allow customer to select menu items and quantities.
   * Show shopping cart.
   * Show total price.
   * Allow customer to enter customer name.
   * Button: `Buat Pesanan`.

2. Order Confirmation and Status

   * Show successful order message.
   * Show queue number clearly.
   * Show ordered items.
   * Show total amount.
   * Show current order status.
   * Show payment instruction: `Pembayaran dilakukan di kasir`.
   * Button: `Lihat Status Pesanan`.

3. Canteen Dashboard

   * Show summary cards:
     * Pesanan Hari Ini
     * Menunggu
     * Diproses
     * Siap Diambil
     * Selesai
     * Pendapatan Hari Ini
   * Show current queue.
   * Show queue number, customer name, total, status, and time.
   * Provide buttons to update order status.
   * Show loading, success, error, and empty states.

4. Menu Management

   * List menu items.
   * Form to create and edit menu items.
   * Show availability status.
   * Button to mark menu as available or unavailable.
   * Confirmation dialog before delete.

5. Canteen Management

   * List canteens.
   * Form to create and edit canteen information.
   * Show active or inactive status.
   * Open canteen ordering page.
   * Show generated QR Code.

6. Order History

   * Show completed and cancelled orders.
   * Show queue number.
   * Show customer name.
   * Show total amount.
   * Show status.
   * Show order date.

UI requirements:

* Use Indonesian language for all labels, buttons, messages, validation, and status text.
* Create a clean and responsive interface.
* The customer ordering page must be mobile-friendly.
* Use simple tables, cards, badges, forms, confirmation dialogs, and empty states.
* Use status badge colors:
  * Menunggu: orange
  * Diproses: blue
  * Siap Diambil: green
  * Selesai: gray
  * Dibatalkan: red
* Use queue condition colors:
  * Sepi: green
  * Sedang: orange
  * Ramai: red
* Show the queue number prominently.
* Do not add charts in the first version.
* Do not add payment gateway.
* Do not add authentication.

Required API routes:

* `GET /api/canteens`
* `POST /api/canteens`
* `GET /api/canteens/:Id`
* `PUT /api/canteens/:Id`
* `DELETE /api/canteens/:Id`

* `GET /api/canteens/:CanteenId/menu`
* `POST /api/canteens/:CanteenId/menu`
* `GET /api/menu/:Id`
* `PUT /api/menu/:Id`
* `DELETE /api/menu/:Id`
* `PUT /api/menu/:Id/availability`

* `POST /api/canteens/:CanteenId/orders`
* `GET /api/orders/:Id`
* `GET /api/canteens/:CanteenId/orders`
* `PUT /api/orders/:Id/status`
* `GET /api/canteens/:CanteenId/queue`
* `GET /api/canteens/:CanteenId/order-history`

* `GET /api/canteens/:CanteenId/dashboard`
* `GET /api/canteens/:CanteenId/qr`

Deliverables:

* Complete frontend and backend source code.
* Prisma schema, migration, and seed data.
* Docker Compose file for MySQL.
* `.env.example`.
* README with installation, database migration, seed, frontend/backend startup, Docker usage, and QR Code usage.
* Ensure the application builds successfully.
* Ensure all basic CRUD operations work.
* Ensure order creation and automatic queue generation work.
* Ensure order status updates work.
* Ensure dashboard data works.
* Ensure QR Code opens the correct canteen ordering page.

Project structure:

* Use a TypeScript monorepo with npm workspaces.
* Structure:

```text
kantinq/
  apps/
    web/
    api/
  packages/
    shared/
```

Shared package requirements:

* Create `packages/shared` as `@kantinq/shared`.
* Store all shared domain models, enums, API response types, DTOs, and shared constants here.
* Both `apps/web` and `apps/api` must import shared types from this package.
* Do not duplicate domain model definitions between frontend and backend.

Example shared files:

```text
packages/shared/src/
  models/
    Canteen.ts
    MenuItem.ts
    Order.ts
    OrderItem.ts
  enums/
    OrderStatus.ts
  dto/
    DashboardResponse.ts
    OrderResponse.ts
    QueueResponse.ts
  constants/
    Queue.ts
  index.ts
```

Model rules:

* Define shared TypeScript interfaces or types only once in `packages/shared`.
* `Canteen`, `MenuItem`, `Order`, `OrderItem`, and `OrderStatus` must be imported by both frontend and backend from `@kantinq/shared`.
* Prisma models remain in the backend because they are database-specific.
* The backend maps Prisma entities to shared API models before returning responses.
* The frontend must not import Prisma types.
* Configure TypeScript paths, workspace dependencies, build scripts, and development scripts correctly so all packages compile successfully.

Scope limitations:

* No online payment.
* No QRIS, GoPay, DANA, OVO, or other payment gateway integration.
* No food delivery.
* No GPS tracking.
* No AI food recommendation.
* No dedicated Android/iOS application.
* No WhatsApp or SMS integration.
* No loyalty or points system.
* No table reservation.
* No academic system integration.
* No multi-campus support.

Development scope for 12 meetings:

* Meeting 1: Problem identification and requirements.
* Meeting 2: System analysis and use case.
* Meeting 3: ERD and database design.
* Meeting 4: Prototype and UI design.
* Meeting 5: Project setup and database connection.
* Meeting 6: Canteen and menu implementation.
* Meeting 7: Order implementation.
* Meeting 8: Queue number and order status.
* Meeting 9: Seller dashboard.
* Meeting 10: Order history and menu availability.
* Meeting 11: QR Code and system integration.
* Meeting 12: Testing, debugging, and final demonstration.

Success criteria:

* Students can open the ordering page through the canteen QR Code.
* Students can view available menu items.
* Students can select items and quantities.
* Students can create an order.
* The system generates a queue number automatically.
* Students can view their order status.
* Canteen staff can view incoming orders.
* Canteen staff can manage the queue.
* Canteen staff can update order status.
* Canteen staff can manage menu items.
* The system stores data correctly in MySQL.
* Order totals are calculated correctly.
* Queue numbers are generated correctly.
* The main workflow works without errors under normal usage.
* The application works on both smartphone and desktop browsers.
