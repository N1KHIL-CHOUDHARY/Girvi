import { PrismaClient } from "@prisma/client";
import { tenantContext } from "../common/context/tenant.context";

const globalPrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error", "warn"],
});

const getPrismaModelProperty = (model: string): string => {
  return model.charAt(0).toLowerCase() + model.slice(1);
};

const TENANT_MODELS: readonly string[] = [
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

const SOFT_DELETE_MODELS: readonly string[] = [
  "User",
  "Customer",
  "PawnTicket",
  "PawnItem",
  "Payment",
];

export const prisma = globalPrisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};
        if (shopId && TENANT_MODELS.includes(model)) {
          Object.assign(args.where, { shopId });
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          Object.assign(args.where, { deletedAt: null });
        }
        return query(args);
      },

      async findFirst({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};
        if (shopId && TENANT_MODELS.includes(model)) {
          Object.assign(args.where, { shopId });
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          Object.assign(args.where, { deletedAt: null });
        }
        return query(args);
      },

      async findUnique({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};

        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);

        if (requiresIsolation) {
          if (shopId && TENANT_MODELS.includes(model)) {
            Object.assign(args.where, { shopId });
          }
          if (SOFT_DELETE_MODELS.includes(model)) {
            Object.assign(args.where, { deletedAt: null });
          }
          const modelProp = getPrismaModelProperty(model);
          const delegate = Reflect.get(globalPrisma, modelProp);
          if (delegate && typeof delegate.findFirst === "function") {
            return delegate.findFirst(args);
          }
        }

        return query(args);
      },

      async count({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};
        if (shopId && TENANT_MODELS.includes(model)) {
          Object.assign(args.where, { shopId });
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          Object.assign(args.where, { deletedAt: null });
        }
        return query(args);
      },

      async update({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};
        if (shopId && TENANT_MODELS.includes(model)) {
          Object.assign(args.where, { shopId });
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          Object.assign(args.where, { deletedAt: null });
        }
        return query(args);
      },

      async updateMany({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};
        if (shopId && TENANT_MODELS.includes(model)) {
          Object.assign(args.where, { shopId });
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          Object.assign(args.where, { deletedAt: null });
        }
        return query(args);
      },

      async delete({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};
        if (shopId && TENANT_MODELS.includes(model)) {
          Object.assign(args.where, { shopId });
        }

        if (SOFT_DELETE_MODELS.includes(model)) {
          const modelProp = getPrismaModelProperty(model);
          const delegate = Reflect.get(globalPrisma, modelProp);
          if (delegate && typeof delegate.update === "function") {
            return delegate.update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
        }

        return query(args);
      },

      async deleteMany({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        args.where = args.where ?? {};
        if (shopId && TENANT_MODELS.includes(model)) {
          Object.assign(args.where, { shopId });
        }

        if (SOFT_DELETE_MODELS.includes(model)) {
          const modelProp = getPrismaModelProperty(model);
          const delegate = Reflect.get(globalPrisma, modelProp);
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
});
