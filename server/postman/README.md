# Postman: register to order fulfillment

Import `Aether_Order_Warehouse_Flow.postman_collection.json` into Postman, set the collection variables below, and run the requests in order.

Required variables:

- `baseUrl`: backend URL, default `http://localhost:5000`.
- `variantId`: active product variant with available inventory.
- `quantity`: quantity to buy; use a small value such as `1` on a development database.
- `csIdentifier` / `csPassword`: login for a user assigned the `CS_STAFF` role.
- `warehouseIdentifier` / `warehousePassword`: login for a user assigned `WAREHOUSE_MANAGER`.

The collection generates a unique customer phone and email. It runs these steps:

1. Register a customer and capture their access token.
2. Add the selected variant to the cart and check out.
3. Log in as CS and confirm the new order.
4. Log in as warehouse, move the order to `packing`, create an order-linked export document for the purchased quantity, then move it to `shipping` and `completed`.

This is an integration flow against the configured database. It creates a customer, order, order history and append-only stock document, and the export reduces on-hand inventory. Run it only against development/test data. The database does not support deleting order and stock audit rows after creation.

If the customer registers successfully but a later step fails, the created customer/order may remain. Use the captured `testUserId`, `orderId`, and `stockDocumentId` collection variables to identify the test records.
