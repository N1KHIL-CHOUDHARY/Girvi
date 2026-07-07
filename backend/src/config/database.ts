import { PrismaClient } from '@prisma/client';
import { tenantContext } from '../common/context/tenant.context';

const globalPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error', 'warn']
});

const getPrismaModelProperty = (model: string): string => {
  return model.charAt(0).toLowerCase() + model.slice(1);
};

// Auto tenant-restricted tables
const TENANT_MODELS = [
  'Shop',
  'Role',
  'User',
  'Customer',
  'PawnTicket',
  'Payment',
  'LedgerEntry',
  'AuditLog',
  'ActivityLog'
];

// Soft delete tables
const SOFT_DELETE_MODELS = [
  'User',
  'Customer',
  'PawnTicket',
  'PawnItem',
  'Payment'
];

export const prisma = globalPrisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        
        const where = (args.where || {}) as any;
        if (shopId && TENANT_MODELS.includes(model)) {
          where.shopId = shopId;
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          where.deletedAt = null;
        }
        args.where = where;
        return query(args);
      },
      
      async findFirst({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;

        const where = (args.where || {}) as any;
        if (shopId && TENANT_MODELS.includes(model)) {
          where.shopId = shopId;
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          where.deletedAt = null;
        }
        args.where = where;
        return query(args);
      },

      async findUnique({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;

        const where = (args.where || {}) as any;
        
        // If tenant isolation is active, or soft delete is active, delegate findUnique to findFirst
        // because findUnique only permits unique constraint fields in where.
        const requiresIsolation = (shopId && TENANT_MODELS.includes(model)) || SOFT_DELETE_MODELS.includes(model);
        
        if (requiresIsolation) {
          if (shopId && TENANT_MODELS.includes(model)) {
            where.shopId = shopId;
          }
          if (SOFT_DELETE_MODELS.includes(model)) {
            where.deletedAt = null;
          }
          args.where = where;
          
          const modelProp = getPrismaModelProperty(model);
          return (globalPrisma as any)[modelProp].findFirst(args);
        }
        
        return query(args);
      },

      async count({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;

        const where = (args.where || {}) as any;
        if (shopId && TENANT_MODELS.includes(model)) {
          where.shopId = shopId;
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          where.deletedAt = null;
        }
        args.where = where;
        return query(args);
      },

      async update({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;

        const where = (args.where || {}) as any;
        if (shopId && TENANT_MODELS.includes(model)) {
          where.shopId = shopId;
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          where.deletedAt = null;
        }
        args.where = where;
        return query(args);
      },

      async updateMany({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;

        const where = (args.where || {}) as any;
        if (shopId && TENANT_MODELS.includes(model)) {
          where.shopId = shopId;
        }
        if (SOFT_DELETE_MODELS.includes(model)) {
          where.deletedAt = null;
        }
        args.where = where;
        return query(args);
      },

      async delete({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;
        
        const where = (args.where || {}) as any;
        if (shopId && TENANT_MODELS.includes(model)) {
          where.shopId = shopId;
        }
        args.where = where;

        // Intercept delete and rewrite as soft update if model supports it
        if (SOFT_DELETE_MODELS.includes(model)) {
          const modelProp = getPrismaModelProperty(model);
          return (globalPrisma as any)[modelProp].update({
            where: args.where,
            data: { deletedAt: new Date() }
          });
        }

        return query(args);
      },

      async deleteMany({ model, args, query }) {
        const store = tenantContext.getStore();
        const shopId = store?.shopId;

        const where = (args.where || {}) as any;
        if (shopId && TENANT_MODELS.includes(model)) {
          where.shopId = shopId;
        }
        args.where = where;

        if (SOFT_DELETE_MODELS.includes(model)) {
          const modelProp = getPrismaModelProperty(model);
          return (globalPrisma as any)[modelProp].updateMany({
            where: args.where,
            data: { deletedAt: new Date() }
          });
        }

        return query(args);
      }
    }
  }
});

