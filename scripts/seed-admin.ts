/**
 * seed-admin.ts
 * Creates the default admin (and optionally developer) seed accounts.
 * Run once from the project root: npm run seed:admin
 */
import { PrismaClient } from '../backend/auth-service/node_modules/@prisma/client/index.js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: './backend/auth-service/.env' });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

const SEED_ACCOUNTS = [
  {
    email: 'admin@digitalbank.com',
    password: 'Admin@123',
    roleName: 'admin',
  },
  {
    email: 'developer@digitalbank.com',
    password: 'Dev@123',
    roleName: 'developer',
  },
];

async function main() {
  console.log('🌱 Seeding admin & developer accounts...\n');

  for (const account of SEED_ACCOUNTS) {
    // Find role (case-insensitive)
    const role = await prisma.role.findFirst({
      where: { name: { equals: account.roleName, mode: 'insensitive' } },
    });

    if (!role) {
      console.error(`❌ Role "${account.roleName}" not found. Run db migrations first.`);
      continue;
    }

    // Skip if already exists
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });

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
        emailVerified: true, // Pre-verified — skip OTP flow for seeded accounts
      },
    });

    console.log(`✅ Created [${account.roleName}] ${account.email}  (password: ${account.password})`);
  }

  console.log('\n✨ Seeding complete!');
  console.log('\nLogin at: http://localhost:3000/login');
  console.log('  Admin:     admin@digitalbank.com  /  Admin@123  →  navigate to /admin/users');
  console.log('  Developer: developer@digitalbank.com  /  Dev@123  →  navigate to /dev-portal');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
