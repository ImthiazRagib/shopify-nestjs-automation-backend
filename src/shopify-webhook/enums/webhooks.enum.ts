export enum ORDER_WEBHOOKS {
  ORDER_CREATED = 'orders/create',
  ORDER_UPDATED = 'orders/updated',
  ORDER_CANCELLED = 'orders/cancelled',
  ORDER_FULFILLED = 'orders/fulfilled',
  ORDER_PARTIALLY_FULFILLED = 'orders/partially_fulfilled',
  ORDER_PAID = 'orders/paid',
  REFUND_CREATED = 'refunds/create',
}

export enum CUSTOMER_WEBHOOKS {
  CUSTOMER_CREATED = 'customers/create',
  CUSTOMER_UPDATED = 'customers/update',
  CUSTOMER_DELETED = 'customers/delete',
  CUSTOMER_DATA_REQUEST = 'customers/data_request',
  CUSTOMER_REDACT = 'customers/redact',
}

export enum PRODUCT_WEBHOOKS {
  PRODUCT_CREATED = 'products/create',
  PRODUCT_UPDATED = 'products/update',
  PRODUCT_DELETED = 'products/delete',
  COLLECTION_CREATED = 'collections/create',
  COLLECTION_UPDATED = 'collections/update',
  COLLECTION_DELETED = 'collections/delete',
}

export enum INVENTORY_WEBHOOKS {
  INVENTORY_LEVEL_UPDATED = 'inventory_levels/update',
  INVENTORY_ITEM_UPDATED = 'inventory_items/update',
}

export enum SHIPPING_WEBHOOKS {
  FULFILLMENT_CREATED = 'fulfillments/create',
  FULFILLMENT_UPDATED = 'fulfillments/update',
  SHIPPING_ADDRESS_UPDATED = 'shipping_addresses/update',
}

export enum PAYMENT_WEBHOOKS {
  CHECKOUT_CREATED = 'checkouts/create',
  CHECKOUT_UPDATED = 'checkouts/update',
  CHECKOUT_DELETED = 'checkouts/delete',
  PAYMENT_TERMS_UPDATED = 'payment_terms/update',
}

export enum SHOP_WEBHOOKS {
  SHOP_UPDATED = 'shop/update',
  SHOP_REDACT = 'shop/redact',
}

export enum APP_WEBHOOKS {
  APP_UNINSTALLED = 'app/uninstalled',
  BILLING_ATTEMPT_FAILED = 'billing/attempts/failed',
  BILLING_ATTEMPT_SUCCEEDED = 'billing/attempts/succeeded',
}
