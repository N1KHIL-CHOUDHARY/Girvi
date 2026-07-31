import { AsyncLocalStorage } from "async_hooks";

export interface TenantStore {
  shopId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export const tenantContext = new AsyncLocalStorage<TenantStore>();

export const getTenantShopId = (): string | undefined => {
  return tenantContext.getStore()?.shopId;
};

export const getTenantUserId = (): string | undefined => {
  return tenantContext.getStore()?.userId;
};

export const getTenantStore = (): TenantStore | undefined => {
  return tenantContext.getStore();
};
