
// src/testing/interceptors/fixture-registry.ts
import USERS from '../fixtures/users.json';
import PRODUCTS from '../fixtures/products.json';
import { ORDERS_FIXTURE } from '../fixtures/orders.fixture'; // TypeScript

export const FIXTURE_REGISTRY: Record<string, unknown> = {
  '/api/users':    USERS,
  '/api/products': PRODUCTS,
  '/api/orders':   ORDERS_FIXTURE,
};
