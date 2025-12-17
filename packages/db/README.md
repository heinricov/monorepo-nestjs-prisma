# @repo/db - Prisma ORM Package

Shared database package menggunakan Prisma ORM untuk monorepo Turborepo. Package ini menyediakan Prisma Client dan database schema yang dapat digunakan oleh semua aplikasi dalam monorepo (API, Web, dll).

## 📋 Daftar Isi

- [Tentang Package](#tentang-package)
- [Instalasi Prisma](#instalasi-prisma)
- [Setup Database](#setup-database)
- [Database Schema](#database-schema)
- [Menggunakan di API (NestJS)](#menggunakan-di-api-nestjs)
- [Menggunakan di Web (Next.js)](#menggunakan-di-web-nextjs)
- [Prisma Commands](#prisma-commands)
- [Migration](#migration)
- [Prisma Studio](#prisma-studio)
- [Troubleshooting](#troubleshooting)

---

## Tentang Package

Package ini adalah shared library yang berisi:

- **Prisma Schema**: Definisi database model
- **Prisma Client**: Type-safe database client
- **Database Adapter**: PostgreSQL adapter dengan `@prisma/adapter-pg`
- **Exports**: `prisma` instance dan Prisma types

### Fitur

- ✅ Type-safe database queries
- ✅ Auto-generated TypeScript types
- ✅ PostgreSQL support dengan adapter
- ✅ Shared across multiple apps
- ✅ Hot reload di development
- ✅ Connection pooling

---

## Instalasi Prisma

### 1. Setup Package dari Scratch

Jika ingin membuat package Prisma baru:

```bash
# Buat folder structure
mkdir -p packages/db/src
cd packages/db

# Init npm package
npm init -y

# Install dependencies
npm install @prisma/client@7.0.0 @prisma/adapter-pg@6.6.0 dotenv pg
npm install -D prisma@7.0.0 tsup@8.2.4

# Init Prisma
npx prisma init
```

### 2. Konfigurasi Package.json

Edit `packages/db/package.json`:

```json
{
  "name": "@repo/db",
  "private": true,
  "version": "0.0.0",
  "main": "dist/index.mjs",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsup src/index.ts --format esm --out-dir dist",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev --skip-generate",
    "db:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio",
    "db:push": "prisma db push"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@prisma/adapter-pg": "^6.6.0",
    "dotenv": "^16.0.0",
    "pg": "^8.0.0"
  },
  "devDependencies": {
    "prisma": "^7.0.0",
    "tsup": "^8.2.4"
  },
  "exports": {
    ".": "./dist/index.mjs"
  }
}
```

### 3. Install Dependencies (Clone Project)

Jika clone repository ini:

```bash
# Dari root monorepo
npm install

# Atau install hanya untuk db package
cd packages/db
npm install
```

---

## Setup Database

### 1. Konfigurasi Environment Variables

Buat file `.env` di **root monorepo** dan di `apps/api/`:

**Root `.env`:**
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Contoh:**

```bash
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"

# Prisma Cloud / Remote
DATABASE_URL="postgres://user:password@db.prisma.io:5432/postgres?sslmode=require"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"

# Neon
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

> **⚠️ Penting**: Copy `.env` ke `apps/api/.env` karena NestJS berjalan dari folder tersebut:
> ```bash
> cp .env apps/api/.env
> ```

### 2. Setup Prisma Config

Buat `prisma.config.ts`:

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
```

### 3. Buat Prisma Client

Buat `src/client.ts`:

```typescript
import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const envPath = resolve(process.cwd(), ".env");
config({ path: envPath });

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Penjelasan:**
- Load `.env` dengan dotenv
- Gunakan `PrismaPg` adapter untuk PostgreSQL
- Singleton pattern untuk development (hot reload)
- Global instance agar tidak membuat koneksi baru setiap hot reload

### 4. Export Package

Buat `src/index.ts`:

```typescript
export { prisma } from "./client.js";
export * from "../generated/prisma/client.js";
```

---

## Database Schema

### Schema File

File `prisma/schema.prisma` berisi definisi database:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Penjelasan Schema

- **generator client**: Generate Prisma Client ke folder `generated/prisma`
- **datasource db**: Menggunakan PostgreSQL
- **model User**: Definisi tabel User
  - `id`: Primary key dengan CUID (Collision-resistant Unique ID)
  - `email`: Unique constraint
  - `password`: String (akan di-hash di application layer)
  - `createdAt`, `updatedAt`: Auto-managed timestamps

### Generate Prisma Client

Setelah ubah schema, generate client:

```bash
# Dari packages/db
npm run db:generate

# Atau dari root
npm run db:generate
```

Ini akan:
1. Membaca `prisma/schema.prisma`
2. Generate TypeScript types ke `generated/prisma/`
3. Membuat Prisma Client yang type-safe

### Push Schema ke Database

Untuk development (tanpa migration):

```bash
# Dari packages/db
npm run db:push

# Atau
npx prisma db push
```

### Build Package

Setelah generate, build package:

```bash
npm run build
```

Ini akan compile TypeScript ke ESM format di `dist/index.mjs`.

---

## Menggunakan di API (NestJS)

### 1. Import di Service

**`apps/api/src/user/user.service.ts`:**

```typescript
import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@repo/db';  // Import dari shared package

@Injectable()
export class UserService {
  // Create user
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  // Get all users
  async findAll() {
    return prisma.user.findMany();
  }

  // Get user by ID
  async findOne(id: string) {
    return prisma.user.findUnique({ 
      where: { id } 
    });
  }

  // Update user
  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // Delete user
  async remove(id: string) {
    return prisma.user.delete({ 
      where: { id } 
    });
  }

  // Find by email
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  // Count users
  async count() {
    return prisma.user.count();
  }
}
```

### 2. Type Safety dengan Prisma Types

```typescript
import { Prisma } from '@repo/db';

// Create Input Type
const createData: Prisma.UserCreateInput = {
  email: "john@example.com",
  name: "John Doe",
  password: "hashed_password"
};

// Update Input Type
const updateData: Prisma.UserUpdateInput = {
  name: "Jane Doe"
};

// Where Clause Type
const where: Prisma.UserWhereInput = {
  email: {
    contains: "@example.com"
  }
};

// Select Type
const select: Prisma.UserSelect = {
  id: true,
  email: true,
  name: true,
  // password: false (exclude)
};
```

### 3. Advanced Queries

```typescript
// Pagination
const users = await prisma.user.findMany({
  skip: 0,
  take: 10,
  orderBy: {
    createdAt: 'desc'
  }
});

// Filtering
const users = await prisma.user.findMany({
  where: {
    email: {
      endsWith: '@example.com'
    },
    createdAt: {
      gte: new Date('2025-01-01')
    }
  }
});

// Count with filter
const count = await prisma.user.count({
  where: {
    email: {
      contains: 'example'
    }
  }
});

// Upsert (Update or Create)
const user = await prisma.user.upsert({
  where: { email: 'john@example.com' },
  update: { name: 'John Updated' },
  create: {
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashed'
  }
});

// Transaction
const result = await prisma.$transaction([
  prisma.user.create({
    data: { email: 'user1@example.com', password: 'hash' }
  }),
  prisma.user.create({
    data: { email: 'user2@example.com', password: 'hash' }
  })
]);
```

---

## Menggunakan di Web (Next.js)

### 1. Server Components (App Router)

**`apps/web/app/users/page.tsx`:**

```typescript
import { prisma } from '@repo/db';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    }
  });

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. Server Actions

**`apps/web/app/actions/users.ts`:**

```typescript
'use server';

import { prisma } from '@repo/db';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  await prisma.user.create({
    data: { name, email, password }
  });

  revalidatePath('/users');
}

export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id }
  });

  revalidatePath('/users');
}
```

### 3. API Routes

**`apps/web/app/api/users/route.ts`:**

```typescript
import { prisma } from '@repo/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const user = await prisma.user.create({
    data: body
  });

  return NextResponse.json(user);
}
```

---

## Prisma Commands

### Development Commands

```bash
# Generate Prisma Client
npm run db:generate
# atau
npx prisma generate

# Push schema ke database (no migration)
npm run db:push
# atau
npx prisma db push

# Reset database (DROP all data)
npx prisma db push --force-reset

# Open Prisma Studio (Database GUI)
npm run db:studio
# atau
npx prisma studio

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

### Production Commands

```bash
# Deploy migrations
npm run db:deploy
# atau
npx prisma migrate deploy

# Generate client for production
npx prisma generate --no-engine
```

---

## Migration

### 1. Buat Migration

Untuk production, gunakan migration system:

```bash
# Buat migration baru
npx prisma migrate dev --name init

# Contoh migration names:
npx prisma migrate dev --name add_user_table
npx prisma migrate dev --name add_role_field
npx prisma migrate dev --name change_id_to_uuid
```

Ini akan:
1. Generate migration file di `prisma/migrations/`
2. Apply migration ke database
3. Generate Prisma Client

### 2. Apply Migration

```bash
# Apply semua pending migrations
npx prisma migrate deploy

# Reset database dan apply all migrations
npx prisma migrate reset
```

### 3. Migration History

```bash
# Check migration status
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve --applied "migration_name"
npx prisma migrate resolve --rolled-back "migration_name"
```

### 4. Workflow Perubahan Schema

**Development:**

```bash
# 1. Edit schema.prisma
# 2. Push ke database
npx prisma db push

# 3. Generate client
npm run db:generate

# 4. Build package
npm run build
```

**Production:**

```bash
# 1. Edit schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_change

# 3. Generate client
npm run db:generate

# 4. Build package
npm run build

# 5. Deploy migration
npx prisma migrate deploy
```

---

## Prisma Studio

Prisma Studio adalah GUI untuk melihat dan mengedit database:

```bash
# Start Prisma Studio
npm run db:studio

# Akan membuka http://localhost:5555
```

Fitur:
- Browse semua tables
- Filter dan search data
- Create, update, delete records
- View relationships
- Export data

---

## Troubleshooting

### 1. Error: "Cannot find module '@repo/db'"

**Penyebab**: Package belum di-build atau tidak terinstall.

**Solusi:**

```bash
cd packages/db
npm run db:generate
npm run build

# Install ulang dari root
cd ../..
npm install
```

### 2. Error: "DATABASE_URL not found"

**Penyebab**: File `.env` tidak ada atau tidak ter-load.

**Solusi:**

```bash
# Copy .env ke apps/api
cp .env apps/api/.env

# Pastikan DATABASE_URL ada di .env
echo 'DATABASE_URL="postgresql://user:pass@host:5432/db"' >> .env
```

### 3. Error: "Prisma schema validation failed"

**Penyebab**: Schema tidak valid.

**Solusi:**

```bash
# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

### 4. Error: "null value in column 'id' violates not-null constraint"

**Penyebab**: Default value tidak di-set untuk ID.

**Solusi:**

Gunakan `cuid()` bukan `uuid()`:

```prisma
model User {
  id String @id @default(cuid())  // ✅ Bekerja di semua DB
  // id String @id @default(uuid()) // ❌ Perlu PostgreSQL extension
}
```

### 5. Error: "Can't reach database server"

**Penyebab**: Database tidak running atau connection string salah.

**Solusi:**

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db push

# Check PostgreSQL running (local)
pg_isready
```

### 6. Prisma Client Outdated

**Solusi:**

```bash
# Re-generate client
npm run db:generate

# Rebuild package
npm run build

# Restart aplikasi
```

### 7. Hot Reload Issues

Jika Prisma Client tidak update saat development:

```bash
# 1. Generate ulang
npm run db:generate

# 2. Rebuild package
npm run build

# 3. Clear cache
rm -rf node_modules/.cache
rm -rf .turbo

# 4. Restart server
```

---

## Best Practices

### 1. Schema Design

- Gunakan `cuid()` untuk ID (lebih compatible)
- Tambahkan `createdAt` dan `updatedAt` untuk tracking
- Gunakan `@unique` untuk fields yang harus unique
- Gunakan `@index` untuk fields yang sering di-query
- Gunakan enums untuk status/role fields

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  authorId  String   @index
  status    Status   @default(DRAFT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User @relation(fields: [authorId], references: [id])
}

enum Status {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### 2. Query Optimization

```typescript
// ❌ Bad: N+1 problem
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  });
}

// ✅ Good: Include relation
const users = await prisma.user.findMany({
  include: {
    posts: true
  }
});
```

### 3. Security

```typescript
// ❌ Bad: Expose password
const user = await prisma.user.findUnique({
  where: { id }
});

// ✅ Good: Exclude sensitive data
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
    // password: false
  }
});
```

### 4. Error Handling

```typescript
import { Prisma } from '@repo/db';

try {
  await prisma.user.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
  }
  throw error;
}
```

### 5. Transactions

```typescript
// Use transaction for multiple operations
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.profile.create({
    data: {
      userId: user.id,
      ...profileData
    }
  });
});
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment mode | `development`, `production` |

---

## Prisma Error Codes

Common Prisma error codes:

- `P2000`: Value too long for column
- `P2002`: Unique constraint violation
- `P2003`: Foreign key constraint violation
- `P2025`: Record not found
- `P1001`: Can't reach database server
- `P1017`: Server closed connection

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## License

MIT

---

**Last Updated**: December 17, 2025
