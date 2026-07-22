/**
 * seed-admin.ts  — run from the auth-service directory
 * npx tsx seed-admin.ts
 */
import * as dotenv from 'dotenv';
dotenv.config(); // Load .env (DATABASE_URL etc.) before Prisma client initialises
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_ACCOUNTS = [
  { email: 'admin@digitalbank.com',     password: 'Admin@123', roleName: 'admin' },
  { email: 'developer@digitalbank.com', password: 'Dev@123',   roleName: 'developer' },
];

async function main() {
  console.log('🌱 Seeding admin & developer accounts...\n');

  for (const account of SEED_ACCOUNTS) {
    const role = await prisma.role.findFirst({
      where: { name: { equals: account.roleName, mode: 'insensitive' } },
    });

    if (!role) {
      console.error(`❌ Role "${account.roleName}" not found. Run db migrations first.`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email: account.email } });
    if (existing) {
      console.log(`⏭️  ${account.email} already exists — skipping.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(account.password, 12);
    await prisma.user.create({
      data: {
        email: account.email,
        passwordHash,
        roleId: role.id,
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    console.log(`✅ Created [${account.roleName}] ${account.email}  (password: ${account.password})`);
  }

  console.log('\n✨ Done! Login at: http://localhost:3000/login');
  console.log('  Admin:     admin@digitalbank.com  /  Admin@123');
  console.log('  Developer: developer@digitalbank.com  /  Dev@123');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
