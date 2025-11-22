# API Reference — Cement Sales & Logistics System

Base URL (development): `http://localhost:5000/api/v0`

Authentication: endpoints are protected with JWT stored in an HTTP-only cookie named `sessionID` (set by the server on login/signup). Include Cookie header in requests made by tools like curl. Some admin-only endpoints also require the user to have `role: admin` (checked by `isAdmin` middleware).

Notes:
- All request bodies are JSON (Content-Type: application/json) unless otherwise mentioned.
- On error responses, the API returns `{ success: false, message: string, ... }` and on success `{ success: true, ... }`.

---

## Auth

### POST /auth/login
- Description: Login user and set session cookie.
- Body:
  - email (string, required)
  - password (string, required)
- Response (200): { success: true, message, user: { id, username, email, role, shopId } }
- Errors: 400 invalid creds, 500 server error

Example curl (login):

```bash
curl -i -X POST http://localhost:5000/api/v0/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```


### POST /auth/signup
- Description: Create user and set session cookie.
- Body:
  - username (string, required)
  - email (string, required)
  - password (string, required)
- Response (201): created user information

### GET /auth/check-auth
- Description: Validate current session cookie and return user details.
- Auth: cookie required
- Response (200): { success: true, user: { id, username, email, role, shopId } }

### POST /auth/logout
- Description: Clears the session cookie.

---

## Users
Base path: `/users` (all requests require authentication)

### GET /users/salespersons
- Description: List all users with role `salesPerson`.
- Auth: any authenticated user

### GET /users/
- Description: List all users
- Auth: admin only

### GET /users/:id
- Description: Get user by ID
- Auth: admin only

### POST /users/
- Description: Admin creates a user
- Body: { username, email, password, role, shopId? }
- Auth: admin only

### PUT /users/:id
- Description: Admin updates a user
- Body: { username?, email?, role?, password?, shopId? }
- Auth: admin only

### DELETE /users/:id
- Description: Delete a user (admin only)

---

## Products
Base path: `/products` (router enforces verifyToken)

### GET /products/
- Description: Get all products
- Auth: required
- Response: { products: [...] }

### GET /products/with-inventory/:shopId
- Description: Get active products with available stock for a shop
- Params: shopId (ObjectId)
- Auth: required

### GET /products/:id
- Description: Get single product by id

### POST /products/
- Description: Create product (admin only).
- Body:
  - name (string, required)
  - brand (string, required)
  - size (number, required)
  - price (number, required)
  - variant? (string)
  - imageUrl? (string)
  - description? (string)
  - isActive? (boolean)
- Response: 201 created product

### PUT /products/:id
- Description: Update product (admin only). Partial fields allowed.

### DELETE /products/:id
- Description: Delete product (admin only). Removes related inventory & history in a transaction; returns warnings if product is referenced by active orders.

### GET /products/brands
- Get distinct brands

### GET /products/brands/:brand
- Get products by brand (case-insensitive exact match)

---

## Inventory
Base path: `/inventory` (all routes use verifyToken)

Common notes:
- Some inventory endpoints are admin-only (protected by `isAdmin`).
- Sales persons can only access inventory of their assigned `shopId`.

### GET /inventory/
- Description: Get inventory items. Admin sees all; salesPerson sees only their shop inventory.
- Query: none
- Response: { success: true, data: [inventoryItems] }

### GET /inventory/stats
- Description: Inventory statistics (totals, low/out-of-stock counts)
- Query: optional `shop` (shopId) — admin may request stats for a shop

### GET /inventory/summary
- Description: Admin only. Summary for all shops (total items, value, low-stock counts)
- Auth: admin

### GET /inventory/shop/:shopId
- Description: Inventory for a specific shop (role-based access)

### GET /inventory/product/:productId
- Description: Inventory entries for a specific product across shops

### GET /inventory/low-stock
- Description: List inventory items below their minStockLevel
- Auth: required

### PUT /inventory/:inventoryId
- Description: Update inventory stock quantity
- Body: { quantity: number }

### POST /inventory/restock
- Description: Add stock to inventory
- Body: { productId, shopId, quantity }

### POST /inventory/adjust
- Description: Manually adjust inventory level (admin only)
- Body: { inventoryId (in params in code comment; route expects body param newQuantity in controller), newQuantity }
- Auth: admin

### POST /inventory/sync
- Description: Admin: ensure all shops have entries for all products; internal sync utility
- Auth: admin

Admin shop inventory management:
- GET /inventory/admin/shops/:shopId — shop details for inventory (admin)
- GET /inventory/admin/shops/:shopId/inventory — admin view for shop inventory
- PUT /inventory/admin/shops/:shopId/inventory/update — update product inventory in a shop (admin)
- GET /inventory/admin/shops/:shopId/inventory/history — paginated history (query: page, limit)

---

## Purchase Orders
Base path: `/purchase-orders` (verifyToken enforced)

### GET /purchase-orders/
- Query: status, supplier, product, page, limit
- Response includes pagination meta

### GET /purchase-orders/stats
- Description: Returns counts per status and total value

### GET /purchase-orders/:id
- Get purchase order details

### POST /purchase-orders/
- Create purchase order (admin only)
- Body (required):
  - orderNumber (string)
  - product (product id)
  - supplier (supplier id)
  - quantity (number)
  - unitPrice (number)
  - expectedDeliveryDate? (ISO string)
  - notes? (string)
- Response: created purchase order with populated product, supplier, createdBy

### PUT /purchase-orders/:id
- Update purchase order (admin only). Partial fields allowed. Status can be one of: Pending, Approved, Delivered, Cancelled.

### DELETE /purchase-orders/:id
- Admin-only delete

---

## Sales Orders
Base path: `/sales-orders` (verifyToken enforced)

### GET /sales-orders/
- Admin-only: returns all sales orders

### GET /sales-orders/:id
- Get a sales order by id

### POST /sales-orders/
- Create a sales order (used by sales flow)
- Body (required):
  - orderNumber (string)
  - customer (customer id)
  - shop (shop id)
  - items: array of { product: productId, quantity: number, unitPrice: number, totalPrice?: number }
  - paymentMethod (string)
  - salesPerson (id)
  - optional: deliveryAddress, notes
- Behavior: reduces inventory quantities in the specified shop in a transaction; returns error if insufficient stock and rolls back.
- Response: 201 sales order with populated relations

### PUT /sales-orders/:id/status
- Admin-only: update order status (Allowed: Pending, Completed, Cancelled, Delivered)
- Body: { status }
- If status changes to `Cancelled`, inventory quantities are restored.

### DELETE /sales-orders/:id
- Admin-only: deletes order and restores inventory if not already cancelled

### GET /sales-orders/customer/:customerId
- Get orders for a customer

### GET /sales-orders/shop/:shopId
- Get orders for a shop

---

## Reports
Base path: `/reports` (verifyToken enforced)

### GET /reports/
- Description: Comprehensive reports and metrics
- Query: shop, from (ISO date), to (ISO date)
- Response: aggregated revenue, product performance, inventory, salesPerson and shop comparisons

### GET /reports/history
- Description: Sales history with filters
- Query options:
  - period (today, yesterday, this_week, last_week, this_month, last_month, custom)
  - from, to (when period=custom)
  - page, limit (pagination)
  - status
  - paymentMethod
  - search (searches orderNumber, notes, and matches customers)
  - sortBy, sortOrder
- Auth: required (salesPerson sees only their sales; admin can filter by shop)

### GET /reports/dashboard-metrics
- Description: sales dashboard metrics for salesPerson (GET /reports/dashboard-metrics)

### GET /reports/admin-dashboard-metrics
- Description: admin-level dashboard metrics (GET /reports/admin-dashboard-metrics)
- Auth: verified (controller enforces admin role in logic)

---

## Shops
Base path: `/shops`

### GET /shops/
- List shops

### GET /shops/:id
- Get shop details

### POST /shops/
- Create shop (admin only)
- Body: { name, address, phone, manager? (user id), email? }
- Initializes inventory entries for the shop for all active products

### PUT /shops/:id
- Update shop (admin only)

### DELETE /shops/:id
- Delete a shop (admin only)

---

## Suppliers
Base path: `/suppliers`

### GET /suppliers/
- Query: search, isActive

### GET /suppliers/:id

### POST /suppliers/
- Create supplier (admin)
- Body: { name, phone, address?, contactPerson?, email?, products?: [productId], isActive? }

### PUT /suppliers/:id
- Update supplier (admin)

### DELETE /suppliers/:id
- Delete supplier (admin)

---

## Customers
Base path: `/customers`

### GET /customers/search?q=...&limit=10
- Quick search for customers (autocomplete) used in checkout
- Query: q (string, min length 2), limit (optional, max 20)
- Response: prioritized list of customers with score and brief info

### GET /customers/
- List all customers

### GET /customers/:id
- Get customer by id

### POST /customers/
- Create a customer (or return existing)
- Body: { name (required), phone (required), email?, address?, company?, customerType?, preferredDeliveryAddress?, preferredPaymentMethod? }
- If a matching customer by phone/email exists, returns existing with 200

### PUT /customers/:id
- Update customer

### DELETE /customers/:id
- Delete customer

### GET /customers/:id/orders
- Get sales orders for a given customer

---

## Error handling & status codes
- 200 OK: success responses
- 201 Created: resource created
- 400 Bad Request: validation errors or missing parameters
- 401 Unauthorized: missing/invalid session
- 403 Forbidden: role-based access denied
- 404 Not Found: resource not found
- 409 Conflict: duplicate key (unique constraint)
- 500 Internal Server Error: unexpected server error

---

## Examples (curl)

Login and get protected resource example:

```bash
# Login (receives cookie named sessionID)
curl -i -c cookiejar.txt -X POST http://localhost:5000/api/v0/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}'

# Use saved cookie to get products
curl -b cookiejar.txt http://localhost:5000/api/v0/products
```

Create a sales order (example payload):

```bash
curl -b cookiejar.txt -X POST http://localhost:5000/api/v0/sales-orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "SO-1001",
    "customer": "64...", 
    "shop": "64...",
    "items": [ { "product": "64...", "quantity": 10, "unitPrice": 400 }, { "product": "64...", "quantity": 5, "unitPrice": 450 } ],
    "paymentMethod": "cash",
    "salesPerson": "64..."
  }'
```

---

## Development / Scripts pointers
- Server start: check `server/package.json` for `dev`/`start` scripts. Default server port is typically 5000 (see `server/src/server.ts`).
- Client base URL: `client/src/lib/api.ts` configures the frontend API base path depending on dev/prod.
- Utility scripts (server): `seed`, `clearDB`, `syncInventory` in `server/src/scripts` — use to populate or maintain development DB.

---