import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CORE_PERMISSIONS = [
  { code: 'read:dashboard', name: 'Read Dashboard', description: 'Permission to view analytics dashboard statistics' },
  { code: 'manage:pawns', name: 'Manage Pawn Tickets', description: 'Permission to create, update, delete, and settle pawn tickets' },
  { code: 'manage:customers', name: 'Manage Customers', description: 'Permission to manage customer details, KYC status, and records' },
  { code: 'manage:payments', name: 'Manage Payments', description: 'Permission to post principal/interest payments and fees' },
  { code: 'manage:employees', name: 'Manage Employees', description: 'Permission to create and manage worker accounts in the shop' },
  { code: 'manage:roles', name: 'Manage Roles', description: 'Permission to manage permissions and shop-level custom roles' },
  { code: 'manage:reports', name: 'Manage Reports', description: 'Permission to view and generate financial ledger reports' },
  { code: 'manage:settings', name: 'Manage Settings', description: 'Permission to modify shop settings and metadata properties' }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed core permissions
  for (const perm of CORE_PERMISSIONS) {
    const result = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        description: perm.description
      },
      create: {
        code: perm.code,
        name: perm.name,
        description: perm.description
      }
    });
    console.log(`✓ Seeded permission: ${result.code}`);
  }

  console.log('🏁 Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
