# Turborepo + NestJS + Prisma ORM - Setup Guide

Dokumentasi lengkap untuk setup dan konfigurasi project monorepo menggunakan Turborepo, NestJS, dan Prisma ORM.

## 📋 Daftar Isi

- [Prerequisites](#prerequisites)
- [Arsitektur Project](#arsitektur-project)
- [Setup Awal](#setup-awal)
- [Konfigurasi Database](#konfigurasi-database)
- [Menjalankan Project](#menjalankan-project)
- [Struktur Folder](#struktur-folder)
- [Membuat Monorepo dari Scratch](#membuat-monorepo-dari-scratch)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Pastikan sistem Anda sudah terinstall:

- **Node.js**: >= 18.x (Recommended: v20.x)
- **npm**: >= 11.x
- **PostgreSQL**: >= 14.x (atau akses ke database PostgreSQL)

Cek versi yang terinstall:

```bash
node --version  # v20.19.5
npm --version   # 11.6.2
```

---

## Arsitektur Project

Project ini menggunakan **monorepo architecture** dengan struktur berikut:

```
monorepo-nestjs-prisama/
├── apps/
│   ├── api/          # NestJS API (Backend)
│   └── web/          # Next.js App (Frontend)
├── packages/
│   ├── db/           # Prisma ORM & Database Client
│   ├── ui/           # Shared UI Components
│   ├── typescript-config/  # Shared TypeScript Config
│   └── eslint-config/       # Shared ESLint Config
├── turbo.json        # Turborepo Configuration
├── package.json      # Root Package Manager
└── .env              # Environment Variables (root)
```

### Teknologi yang Digunakan

- **Turborepo**: Build system untuk monorepo
- **NestJS**: Backend framework (Port: 4000)
- **Next.js**: Frontend framework (Port: 3000)
- **Prisma ORM**: Database toolkit dengan PostgreSQL
- **TypeScript**: Type-safe development
- **npm workspaces**: Package management

---

## Setup Awal

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <repository-url>
cd monorepo-nestjs-prisama

# Install semua dependencies
npm install
```

Perintah `npm install` akan menginstall dependencies untuk:

- Root project
- Semua apps (`apps/*`)
- Semua packages (`packages/*`)

### 2. Konfigurasi Environment Variables

Buat file `.env` di **dua lokasi**:

#### a. Root Project (`.env`)

```bash
# /monorepo-nestjs-prisama/.env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

#### b. Apps API (`.env`)

```bash
# /monorepo-nestjs-prisama/apps/api/.env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Contoh DATABASE_URL:**

```bash
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"

# Prisma Cloud (Example dari project)
DATABASE_URL="postgres://user:password@db.prisma.io:5432/postgres?sslmode=require"
```

> **⚠️ Penting**: Kedua file `.env` harus memiliki `DATABASE_URL` yang sama karena NestJS berjalan dari folder `apps/api` dan Prisma CLI berjalan dari root.

---

## Konfigurasi Database

### 1. Generate Prisma Client

Prisma Client perlu di-generate berdasarkan schema:

```bash
# Generate dari root
npm run db:generate

# Atau langsung dari package db
cd packages/db
npm run db:generate
```

Perintah ini akan:

- Membaca `packages/db/prisma/schema.prisma`
- Generate TypeScript types ke `packages/db/generated/prisma`
- Build package `@repo/db`

### 2. Push Schema ke Database

Untuk development, gunakan `db push`:

```bash
npm run db:deploy

# Atau dari package db
cd packages/db
npx prisma db push
```

### 3. Buat dan Jalankan Migration (Production)

Untuk production, gunakan migration:

```bash
# Buat migration baru
cd packages/db
npx prisma migrate dev --name init

# Deploy migration ke production
npm run db:deploy
```

### 4. Prisma Studio (Database GUI)

Untuk melihat dan mengedit data:

```bash
npm run db:studio
```

Akan membuka Prisma Studio di `http://localhost:5555`

---

## Menjalankan Project

### Development Mode

#### Jalankan Semua Apps (Parallel)

```bash
# Jalankan api + web secara bersamaan
npm run dev
```

#### Jalankan Apps Secara Terpisah

```bash
# Terminal 1 - NestJS API (Port 4000)
cd apps/api
npm run dev

# Terminal 2 - Next.js Web (Port 3000)
cd apps/web
npm run dev
```

### Build Project

```bash
# Build semua apps & packages
npm run build

# Build specific app
npx turbo run build --filter=api
npx turbo run build --filter=web
```

### Production Mode

```bash
# Build terlebih dahulu
npm run build

# Jalankan API
cd apps/api
npm run start:prod

# Jalankan Web
cd apps/web
npm run start
```

---

## Struktur Folder

### Apps

#### `apps/api` - NestJS Backend

```
apps/api/
├── src/
│   ├── prisma/
│   │   └── prisma.service.ts      # Prisma Service (optional)
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── user.controller.ts     # HTTP Routes
│   │   ├── user.service.ts        # Business Logic
│   │   └── user.module.ts         # Module Definition
│   ├── app.module.ts              # Root Module
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts                    # Entry Point
├── test/
├── .env                           # Environment Variables
├── nest-cli.json                  # NestJS Config
├── tsconfig.json
└── package.json
```

**Key Files:**

- `main.ts`: Entry point, import `dotenv/config` di awal
- `user.service.ts`: Import `prisma` dari `@repo/db`

#### `apps/web` - Next.js Frontend

```
apps/web/
├── app/
│   ├── page.tsx                   # Homepage
│   └── layout.tsx                 # Root Layout
├── public/                        # Static Assets
├── next.config.js
├── tsconfig.json
└── package.json
```

### Packages

#### `packages/db` - Prisma Package

```
packages/db/
├── prisma/
│   └── schema.prisma              # Database Schema
├── src/
│   ├── client.ts                  # Prisma Client Instance
│   └── index.ts                   # Package Exports
├── generated/
│   └── prisma/                    # Generated Client
├── .env                           # Database URL
├── prisma.config.ts               # Prisma CLI Config
└── package.json
```

**Key Configurations:**

**`schema.prisma`**:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id       Int     @id @default(autoincrement())
  name     String?
  email    String  @unique
  password String
}
```

**`src/client.ts`**:

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

**`package.json`**:

```json
{
  "name": "@repo/db",
  "main": "dist/index.mjs",
  "scripts": {
    "build": "tsup src/index.ts --format esm --out-dir dist",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev --skip-generate",
    "db:deploy": "prisma migrate deploy"
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
  }
}
```

#### `packages/ui` - Shared Components

```
packages/ui/
├── src/
│   ├── button.tsx
│   └── card.tsx
└── package.json
```

---

## Membuat Monorepo dari Scratch

### Step 1: Inisialisasi Turborepo

```bash
# Install Turborepo CLI
npm install -g turbo

# Buat project baru
npx create-turbo@latest

# Pilih options:
# - Where would you like to create your Turborepo? my-monorepo
# - Which package manager do you want to use? npm
```

### Step 2: Setup Workspace

Edit `package.json` di root:

```json
{
  "name": "monorepo-nestjs-prisama",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "db:generate": "turbo run db:generate",
    "db:deploy": "turbo run db:deploy"
  },
  "devDependencies": {
    "turbo": "^2.6.3",
    "prettier": "^3.7.4",
    "typescript": "5.9.2"
  },
  "packageManager": "npm@11.6.2",
  "engines": {
    "node": ">=18"
  }
}
```

### Step 3: Konfigurasi Turborepo

Buat `turbo.json`:

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^db:generate"],
      "outputs": [".next/**", "dist/**"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^db:generate"]
    },
    "db:generate": {
      "cache": false
    },
    "db:deploy": {
      "cache": false
    }
  }
}
```

### Step 4: Buat Package Prisma

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
    "db:generate": "prisma generate"
  },
  "exports": {
    ".": "./dist/index.mjs"
  }
}
```

Buat `packages/db/src/client.ts` dan `packages/db/src/index.ts` seperti struktur di atas.

### Step 5: Setup NestJS App

```bash
# Install NestJS CLI
npm install -g @nestjs/cli

# Buat app baru di apps/
cd apps
nest new api

# Pilih npm sebagai package manager
```

Edit `apps/api/package.json`, tambahkan dependency:

```json
{
  "dependencies": {
    "@repo/db": "^0.0.0"
  }
}
```

Edit `apps/api/src/main.ts`:

```typescript
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
```

### Step 6: Setup Next.js App

```bash
cd apps
npx create-next-app@latest web

# Pilih options:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes (optional)
# - App Router: Yes
```

Edit `apps/web/package.json`, tambahkan dependency:

```json
{
  "dependencies": {
    "@repo/db": "^0.0.0"
  },
  "scripts": {
    "dev": "next dev --port 3000"
  }
}
```

### Step 7: Generate Prisma & Build

```bash
# Kembali ke root
cd ../..

# Install semua dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Push schema ke database
cd packages/db
npx prisma db push

# Build packages
cd ../..
npm run build
```

### Step 8: Jalankan Development

```bash
npm run dev
```

---

## Troubleshooting

### 1. Error: "Database does not exist"

**Penyebab**: Environment variable `DATABASE_URL` tidak ter-load.

**Solusi**:

- Pastikan file `.env` ada di root dan di `apps/api/`
- Pastikan kedua file berisi `DATABASE_URL` yang sama
- Restart server setelah menambah/mengubah `.env`

```bash
# Copy .env ke apps/api
cp .env apps/api/.env
```

### 2. Error: "Invalid prisma.user.findMany() invocation"

**Penyebab**: Prisma Client belum di-generate atau outdated.

**Solusi**:

```bash
# Generate ulang Prisma Client
npm run db:generate

# Rebuild package db
cd packages/db
npm run build

# Restart server
```

### 3. Error: "Cannot find module '@repo/db'"

**Penyebab**: Package `@repo/db` belum di-build.

**Solusi**:

```bash
# Build package db
cd packages/db
npm run build

# Install dependencies ulang dari root
cd ../..
npm install
```

### 4. Port sudah digunakan

**Solusi**:

```bash
# Kill process di port 4000 (API)
lsof -ti:4000 | xargs kill -9

# Kill process di port 3000 (Web)
lsof -ti:3000 | xargs kill -9
```

### 5. Turborepo cache issue

**Solusi**:

```bash
# Clear Turbo cache
npx turbo run build --force

# Atau hapus cache manual
rm -rf .turbo
rm -rf node_modules/.cache
```

### 6. TypeScript errors setelah generate Prisma

**Solusi**:

```bash
# Rebuild package db
cd packages/db
npm run build

# Restart TypeScript server di IDE
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

---

## API Endpoints

Setelah server berjalan, API tersedia di `http://localhost:4000`:

### User Endpoints

| Method | Endpoint     | Description     |
| ------ | ------------ | --------------- |
| GET    | `/users`     | Get all users   |
| GET    | `/users/:id` | Get user by ID  |
| POST   | `/users`     | Create new user |
| PATCH  | `/users/:id` | Update user     |
| DELETE | `/users/:id` | Delete user     |

### Example Request

**Create User:**

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }'
```

**Get All Users:**

```bash
curl http://localhost:4000/users
```

---

## Scripts Cheatsheet

### Root Commands

```bash
npm run dev              # Jalankan semua apps (dev mode)
npm run build            # Build semua apps & packages
npm run db:generate      # Generate Prisma Client
npm run db:deploy        # Deploy migrations
npm run db:studio        # Open Prisma Studio
npm run lint             # Lint semua projects
npm run format           # Format code dengan Prettier
```

### Package DB Commands

```bash
cd packages/db
npm run build            # Build package db
npm run db:generate      # Generate Prisma Client
npx prisma db push       # Push schema tanpa migration
npx prisma migrate dev   # Buat migration baru
npx prisma studio        # Open Prisma Studio
```

### NestJS API Commands

```bash
cd apps/api
npm run dev              # Development mode
npm run build            # Build production
npm run start:prod       # Run production
npm run lint             # Lint code
```

### Next.js Web Commands

```bash
cd apps/web
npm run dev              # Development mode (port 3000)
npm run build            # Build production
npm run start            # Run production
npm run lint             # Lint code
```

---

## Best Practices

### 1. Database Schema Changes

Selalu gunakan migration untuk production:

```bash
cd packages/db

# 1. Ubah schema.prisma
# 2. Buat migration
npx prisma migrate dev --name add_new_field

# 3. Generate client
npm run db:generate

# 4. Rebuild package
npm run build
```

### 2. Adding New Dependencies

Install dari root dengan workspace flag:

```bash
# Install di specific app
npm install <package> --workspace=api

# Install di specific package
npm install <package> --workspace=@repo/db

# Install di semua workspaces
npm install <package> --workspaces
```

### 3. Environment Variables

- Jangan commit file `.env` ke git
- Gunakan `.env.example` untuk template
- Untuk production, gunakan environment variables dari platform (Vercel, Railway, dll)

### 4. Type Safety

Setelah ubah Prisma schema:

```bash
# 1. Generate types
npm run db:generate

# 2. Rebuild db package
cd packages/db && npm run build

# 3. Restart TypeScript server di IDE
```

---

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## License

MIT

---

**Last Updated**: December 17, 2025
