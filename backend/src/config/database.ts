import { PrismaClient } from "@prisma/client";
import { tenantContext } from "../common/context/tenant.context";
import { NotFoundError, BadRequestError } from "../common/errors/AppError";

export const globalPrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error", "warn"],
});

const getPrismaModelProperty = (model: string): string =>
  model.charAt(0).toLowerCase() + model.slice(1);

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
] as const;

export const SOFT_DELETE_MODELS: readonly string[] = [
  "User",
  "Customer",
  "PawnTicket",
  "PawnItem",
  "Payment",
] as const;

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

interface ModelDelegate {
  findFirst?: (args: ExtensionArgs) => Promise<{ id: string } | null>;
  findFirstOrThrow?: (args: ExtensionArgs) => Promise<{ id: string }>;
  update?: (args: ExtensionArgs) => Promise<unknown>;
  updateMany?: (args: ExtensionArgs) => Promise<unknown>;
  delete?: (args: ExtensionArgs) => Promise<unknown>;
}

const applyTenantAndSoftDelete = (
  where: Record<string, unknown> = {},
  model: string,
  shopId?: string
): Record<string, unknown> => {
  const clause = { ...where };

  if (shopId && TENANT_MODELS.includes(model)) {
    const key = model === "Shop" ? "id" : "shopId";
    clause[key] = clause[key] ?? shopId;
  }

  if (SOFT_DELETE_MODELS.includes(model)) {
    clause.deletedAt = clause.deletedAt ?? null;
  }

  return clause;
};

const getModelDelegate = (model: string): ModelDelegate | undefined => {
  const modelProp = getPrismaModelProperty(model);
  return Reflect.get(globalPrisma, modelProp) as ModelDelegate | undefined;
};

export const tenantExtensionConfig = {
  query: {
    $allModels: {
      async findMany({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);
        return query(args);
      },

      async findFirst({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);
        return query(args);
      },

      async findFirstOrThrow({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);
        return query(args);
      },

      async findUnique({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);

        if (!requiresIsolation) return query(args);

        const delegate = getModelDelegate(model);
        if (typeof delegate?.findFirst === "function") {
          return delegate.findFirst({
            ...args,
            where: applyTenantAndSoftDelete(args.where, model, shopId),
          });
        }

        return query(args);
      },

      async findUniqueOrThrow({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);

        if (!requiresIsolation) return query(args);

        const delegate = getModelDelegate(model);
        if (typeof delegate?.findFirstOrThrow === "function") {
          return delegate.findFirstOrThrow({
            ...args,
            where: applyTenantAndSoftDelete(args.where, model, shopId),
          });
        }

        return query(args);
      },

      async count({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);
        return query(args);
      },

      async aggregate({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);
        return query(args);
      },

      async groupBy({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);
        return query(args);
      },

      async create({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        if (shopId && TENANT_MODELS.includes(model) && model !== "Shop" && args.data && !Array.isArray(args.data)) {
          args.data.shopId = args.data.shopId ?? (args.data.shop ? undefined : shopId);
        }
        return query(args);
      },

      async createMany({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        if (shopId && TENANT_MODELS.includes(model) && model !== "Shop" && args.data) {
          if (Array.isArray(args.data)) {
            for (const item of args.data) {
              if (item) item.shopId = item.shopId ?? shopId;
            }
          } else {
            args.data.shopId = args.data.shopId ?? shopId;
          }
        }
        return query(args);
      },

      async upsert({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        if (shopId && TENANT_MODELS.includes(model) && model !== "Shop" && args.create) {
          args.create.shopId = args.create.shopId ?? (args.create.shop ? undefined : shopId);
        }
        return query(args);
      },

      async update({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);

        if (requiresIsolation) {
          const delegate = getModelDelegate(model);
          if (typeof delegate?.findFirst === "function") {
            const checkWhere = applyTenantAndSoftDelete(args.where, model, shopId);
            const existing = await delegate.findFirst({ where: checkWhere });
            if (!existing) {
              throw new NotFoundError(`Record to update not found or access denied for model ${model}`);
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
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);
        return query(args);
      },

      async delete({ model, args, query }: ExtensionQueryContext) {
        const shopId = tenantContext.getStore()?.shopId;
        const delegate = getModelDelegate(model);

        if (SOFT_DELETE_MODELS.includes(model)) {
          const checkWhere = applyTenantAndSoftDelete(args.where, model, shopId);
          if (typeof delegate?.findFirst === "function") {
            const existing = await delegate.findFirst({ where: checkWhere });
            if (!existing) {
              throw new NotFoundError(`Record to delete not found or access denied for model ${model}`);
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
          if (typeof delegate?.findFirst === "function") {
            const checkWhere = applyTenantAndSoftDelete(args.where, model, shopId);
            const existing = await delegate.findFirst({ where: checkWhere });
            if (!existing) {
              throw new NotFoundError(`Record to delete not found or access denied for model ${model}`);
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
        const shopId = tenantContext.getStore()?.shopId;
        args.where = applyTenantAndSoftDelete(args.where, model, shopId);

        if (SOFT_DELETE_MODELS.includes(model)) {
          const delegate = getModelDelegate(model);
          if (typeof delegate?.updateMany === "function") {
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

export async function executeTenantRawQuery<T>(
  queryFn: (shopId: string) => Promise<T>
): Promise<T> {
  const shopId = tenantContext.getStore()?.shopId;
  if (!shopId) {
    throw new BadRequestError("Tenant context missing: shopId is required for raw query execution.");
  }
  return queryFn(shopId);
}
