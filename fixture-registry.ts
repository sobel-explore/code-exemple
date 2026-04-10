export interface FixtureConfig {
  body: unknown;
  status?: number;  // ← optionnel, 200 par défaut
}

export const FIXTURE_REGISTRY: Record<string, FixtureConfig> = {
  '/api/users':    { body: USERS },
  '/api/orders':   { body: ORDERS, status: 200 },
  '/api/products': { body: null,   status: 404 },  // ← erreur simulée
  '/api/login':    { body: null,   status: 401 },
};
