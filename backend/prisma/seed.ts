import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  // Create roles
  const ownerRole = await prisma.role.upsert({
    where: { name: 'OWNER' },
    update: {},
    create: { name: 'OWNER' },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: { name: 'MANAGER' },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'STAFF' },
    update: {},
    create: { name: 'STAFF' },
  });

  const kitchenRole = await prisma.role.upsert({
    where: { name: 'KITCHEN' },
    update: {},
    create: { name: 'KITCHEN' },
  });

  console.log('Roles created:', { ownerRole, managerRole, staffRole, kitchenRole });

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      fullName: 'Admin User',
      roleId: ownerRole.id,
      isActive: true,
    },
  });

  console.log('Admin user created:', adminUser);

  // Create test users
  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { username: 'manager' },
      update: {},
      create: {
        username: 'manager',
        passwordHash: hashedPassword,
        fullName: 'Manager User',
        roleId: managerRole.id,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { username: 'staff' },
      update: {},
      create: {
        username: 'staff',
        passwordHash: hashedPassword,
        fullName: 'Staff User',
        roleId: staffRole.id,
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { username: 'kitchen' },
      update: {},
      create: {
        username: 'kitchen',
        passwordHash: hashedPassword,
        fullName: 'Kitchen User',
        roleId: kitchenRole.id,
        isActive: true,
      },
    }),
  ]);

  console.log('Test users created:', testUsers);

  await prisma.$disconnect();
  console.log('\n✅ Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('  - admin / admin123 (OWNER)');
  console.log('  - manager / admin123 (MANAGER)');
  console.log('  - staff / admin123 (STAFF)');
  console.log('  - kitchen / admin123 (KITCHEN)');
}

main()
  .catch(console.error)
  .finally(async () => {
    process.exit(0);
  });
