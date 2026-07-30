import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: {
      NODE_ENV: "test",
      PORT: "5000",
      DATABASE_URL: "postgresql://test:test@localhost:5432/testdb",
      JWT_SECRET: "test-jwt-secret-key-min-32-characters-long",
      JWT_EXPIRES_IN: "1d",
      REFRESH_TOKEN_SECRET: "test-refresh-secret-key-32-chars-long",
      REFRESH_TOKEN_EXPIRES_IN: "7d",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "mock-token",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "mock-key",
      SUPABASE_SERVICE_ROLE_KEY: "mock-service-key",
      JWT_REFRESH_SECRET: "mock-jwt-refresh-secret-key-32-chars-long",
      ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
