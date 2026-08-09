import { PrismaClient } from "@prisma/client";
import { tenantContext } from "../common/context/tenant.context";

export const globalPrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error", "warn"],
});

const getPrismaModelProperty = (model: string): string => {
  return model.charAt(0).toLowerCase() + model.slice(1);
};

export const TENANT_MODELS: readonly string[] = [
  "Shop",
  "Role",
  "User",
  "Customer",
  "PawnTicket",
  "Payment",
  "LedgerEntry",
  "AuditLog",
  "ActivityLog",
];

export const SOFT_DELETE_MODELS: readonly string[] = [
  "User",
  "Customer",
  "PawnTicket",
  "PawnItem",
  "Payment",
];

interface ExtensionArgs {
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
  create?: Record<string, unknown>;
  include?: unknown;
  select?: unknown;
}

interface ExtensionQueryContext {
  model: string;
  args: ExtensionArgs;
  query: (args: ExtensionArgs) => Promise<unknown>;
}

interface DelegateWithFindFirst {
  findFirst?: (args: ExtensionArgs) => Promise<{ id: string } | null>;
  findFirstOrThrow?: (args: ExtensionArgs) => Promise<{ id: string }>;
  update?: (args: ExtensionArgs) => Promise<unknown>;
  updateMany?: (args: ExtensionArgs) => Promise<unknown>;
  delete?: (args: ExtensionArgs) => Promise<unknown>;
}

const applyTenantAndSoftDelete = (
  where: Record<string, unknown>,
  model: string,
  shopId?: string
): Record<string, unknown> => {
  if (shopId && TENANT_MODELS.includes(model)) {
    if (model === "Shop") {
      if (where.id === undefined) {
        where.id = shopId;
      }
    } else {
      if (where.shopId === undefined) {
        where.shopId = shopId;
      }
    }
  }
  if (SOFT_DELETE_MODELS.includes(model)) {
    if (where.deletedAt === undefined) {
      where.deletedAt = null;
    }
  }
  return where;
};

export const tenantExtensionConfig = {
  query: {
    $allModels: {
      async findMany({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);
        return query(args);
      },

      async findFirst({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);
        return query(args);
      },

      async findFirstOrThrow({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);
        return query(args);
      },

      async findUnique({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);

        if (requiresIsolation) {
          const whereClause = applyTenantAndSoftDelete({ ...(args.where ?? {}) }, model, shopId);
          const modelProp = getPrismaModelProperty(model);
          const delegate = Reflect.get(globalPrisma, modelProp) as DelegateWithFindFirst | undefined;
          if (delegate && typeof delegate.findFirst === "function") {
            return delegate.findFirst({
              ...args,
              where: whereClause,
            });
          }
        }

        return query(args);
      },

      async findUniqueOrThrow({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);

        if (requiresIsolation) {
          const whereClause = applyTenantAndSoftDelete({ ...(args.where ?? {}) }, model, shopId);
          const modelProp = getPrismaModelProperty(model);
          const delegate = Reflect.get(globalPrisma, modelProp) as DelegateWithFindFirst | undefined;
          if (delegate && typeof delegate.findFirstOrThrow === "function") {
            return delegate.findFirstOrThrow({
              ...args,
              where: whereClause,
            });
          }
        }

        return query(args);
      },

      async count({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);
        return query(args);
      },

      async aggregate({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);
        return query(args);
      },

      async groupBy({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);
        return query(args);
      },

      async create({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        if (shopId && TENANT_MODELS.includes(model) && model !== "Shop") {
          if (args.data && !Array.isArray(args.data) && args.data.shopId === undefined) {
            args.data.shopId = shopId;
          }
        }
        return query(args);
      },

      async createMany({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        if (shopId && TENANT_MODELS.includes(model) && model !== "Shop") {
          if (Array.isArray(args.data)) {
            args.data.forEach((item) => {
              if (item && item.shopId === undefined) {
                item.shopId = shopId;
              }
            });
          } else if (args.data && !Array.isArray(args.data) && args.data.shopId === undefined) {
            args.data.shopId = shopId;
          }
        }
        return query(args);
      },

      async upsert({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        if (shopId && TENANT_MODELS.includes(model) && model !== "Shop") {
          if (args.create && args.create.shopId === undefined) {
            args.create.shopId = shopId;
          }
        }
        return query(args);
      },

      async update({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);

        if (requiresIsolation) {
          const modelProp = getPrismaModelProperty(model);
          const delegate = Reflect.get(globalPrisma, modelProp) as DelegateWithFindFirst | undefined;
          if (delegate && typeof delegate.findFirst === "function") {
            const checkWhere = applyTenantAndSoftDelete({ ...(args.where ?? {}) }, model, shopId);
            const existing = await delegate.findFirst({ where: checkWhere });
            if (!existing) {
              throw new Error(`Record to update not found or access denied for model ${model}`);
            }
            if (typeof delegate.update === "function") {
              return delegate.update({
                where: { id: existing.id },
                data: args.data,
                include: args.include,
                select: args.select,
              });
            }
          }
        }

        return query(args);
      },

      async updateMany({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);
        return query(args);
      },

      async delete({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        const modelProp = getPrismaModelProperty(model);
        const delegate = Reflect.get(globalPrisma, modelProp) as DelegateWithFindFirst | undefined;

        if (SOFT_DELETE_MODELS.includes(model)) {
          const checkWhere = applyTenantAndSoftDelete({ ...(args.where ?? {}) }, model, shopId);
          if (delegate && typeof delegate.findFirst === "function") {
            const existing = await delegate.findFirst({ where: checkWhere });
            if (!existing) {
              throw new Error(`Record to delete not found or access denied for model ${model}`);
            }
            if (typeof delegate.update === "function") {
              return delegate.update({
                where: { id: existing.id },
                data: { deletedAt: new Date() },
                include: args.include,
                select: args.select,
              });
            }
          }
        }

        if (shopId && TENANT_MODELS.includes(model)) {
          if (delegate && typeof delegate.findFirst === "function") {
            const checkWhere = applyTenantAndSoftDelete({ ...(args.where ?? {}) }, model, shopId);
            const existing = await delegate.findFirst({ where: checkWhere });
            if (!existing) {
              throw new Error(`Record to delete not found or access denied for model ${model}`);
            }
            if (typeof delegate.delete === "function") {
              return delegate.delete({
                where: { id: existing.id },
                include: args.include,
                select: args.select,
              });
            }
          }
        }

        return query(args);
      },

      async deleteMany({ model, args, query }: ExtensionQueryContext) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = applyTenantAndSoftDelete(args.where ?? {}, model, shopId);

        if (SOFT_DELETE_MODELS.includes(model)) {
          const modelProp = getPrismaModelProperty(model);
          const delegate = Reflect.get(globalPrisma, modelProp) as DelegateWithFindFirst | undefined;
          if (delegate && typeof delegate.updateMany === "function") {
            return delegate.updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
        }

        return query(args);
      },
    },
  },
};

export const prisma = globalPrisma.$extends(tenantExtensionConfig);




