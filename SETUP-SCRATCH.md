# Setup from Scratch - Complete Build Guide

Panduan lengkap untuk membuat monorepo Turborepo + NestJS + Prisma ORM dari project kosong.

## 📋 Daftar Isi

- [Prerequisites](#prerequisites)
- [Step 1: Initialize Turborepo](#step-1-initialize-turborepo)
- [Step 2: Setup Root Workspace](#step-2-setup-root-workspace)
- [Step 3: Configure Turborepo](#step-3-configure-turborepo)
- [Step 4: Create Prisma Package](#step-4-create-prisma-package)
- [Step 5: Setup NestJS API](#step-5-setup-nestjs-api)
- [Step 6: Setup Next.js Web](#step-6-setup-nextjs-web)
- [Step 7: Setup Shared Packages](#step-7-setup-shared-packages)
- [Step 8: Configure Database](#step-8-configure-database)
- [Step 9: First Run](#step-9-first-run)
- [Step 10: Push to GitHub](#step-10-push-to-github)

---

## Prerequisites

Pastikan sistem Anda sudah terinstall:

- **Node.js**: >= 18.x (Recommended: v20.x)
- **npm**: >= 11.x
- **PostgreSQL**: >= 14.x
- **Git**: Latest version

### Install Global Tools

```bash
# Install Turborepo CLI
npm install -g turbo

# Install NestJS CLI
npm install -g @nestjs/cli

# Verify installations
turbo --version
nest --version
```

---

## Step 1: Initialize Turborepo

### 1.1 Create Turborepo Project

```bash
# Create new turborepo
npx create-turbo@latest

# Interactive prompts:
# ✔ Where would you like to create your Turborepo? › my-monorepo
# ✔ Which package manager do you want to use? › npm
```

Atau manual:

```bash
# Create project folder
mkdir monorepo-nestjs-prisama
cd monorepo-nestjs-prisama

# Initialize npm
npm init -y
```

### 1.2 Create Folder Structure

```bash
# Create apps and packages folders
mkdir -p apps packages

# Create config folders
mkdir -p packages/{db,ui,typescript-config,eslint-config}
```

**Struktur awal:**
```
monorepo-nestjs-prisama/
├── apps/
├── packages/
│   ├── db/
│   ├── ui/
│   ├── typescript-config/
│   └── eslint-config/
└── package.json
```

---

## Step 2: Setup Root Workspace

### 2.1 Edit Root `package.json`

```json
{
  "name": "monorepo-nestjs-prisama",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate",
    "db:deploy": "turbo run db:deploy",
    "db:studio": "turbo run db:studio",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "devDependencies": {
    "prettier": "^3.7.4",
    "turbo": "^2.6.3",
    "typescript": "5.9.2"
  },
  "engines": {
    "node": ">=18"
  },
  "packageManager": "npm@11.6.2"
}
```

### 2.2 Install Root Dependencies

```bash
npm install
```

### 2.3 Create `.gitignore`

```bash
touch .gitignore
```

**Content `.gitignore`:**
```gitignore
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Turbo
.turbo/

# Testing
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
```

---

## Step 3: Configure Turborepo

### 3.1 Create `turbo.json`

```bash
touch turbo.json
```

**Content:**
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
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^db:generate"]
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false,
      "persistent": true
    },
    "db:deploy": {
      "cache": false
    },
    "db:studio": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## Step 4: Create Prisma Package

### 4.1 Initialize Package

```bash
cd packages/db

# Initialize npm package
npm init -y
```

### 4.2 Install Dependencies

```bash
# Install Prisma dependencies
npm install @prisma/client@7.0.0 @prisma/adapter-pg@6.6.0 dotenv pg

# Install dev dependencies
npm install -D prisma@7.0.0 tsup@8.2.4
```

### 4.3 Initialize Prisma

```bash
npx prisma init
```

Ini akan membuat:
- `prisma/schema.prisma`
- `.env` file

### 4.4 Edit `package.json`

**`packages/db/package.json`:**
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
    "db:studio": "prisma studio"
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

### 4.5 Create Prisma Schema

Edit `prisma/schema.prisma`:

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

### 4.6 Create Prisma Config

Create `prisma.config.ts`:

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

### 4.7 Create Source Files

**Create folder:**
```bash
mkdir src
```

**`src/client.ts`:**
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

**`src/index.ts`:**
```typescript
export { prisma } from "./client.js";
export * from "../generated/prisma/client.js";
```

### 4.8 Setup Environment

Edit `.env`:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
```

### 4.9 Back to Root

```bash
cd ../..
```

---

## Step 5: Setup NestJS API

### 5.1 Create NestJS App

```bash
cd apps

# Create NestJS app
nest new api

# Choose npm as package manager
```

### 5.2 Remove Nested Git

```bash
# Remove nested .git folder
rm -rf api/.git
```

### 5.3 Add Dependencies

```bash
cd api

# Install dependencies
npm install bcrypt
npm install -D @types/bcrypt
```

### 5.4 Edit `package.json`

Add `@repo/db` dependency:

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@nestjs/mapped-types": "^2.1.0",
    "@repo/db": "^0.0.0",
    "bcrypt": "^5.1.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2"
  },
  "scripts": {
    "dev": "nest start --watch"
  }
}
```

### 5.5 Edit `src/main.ts`

Add dotenv import at top:

```typescript
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
```

### 5.6 Create User Module

```bash
# Generate user resource
nest generate resource user

# Choose:
# ? What transport layer do you use? REST API
# ? Would you like to generate CRUD entry points? Yes
```

### 5.7 Edit User Service

**`src/user/user.service.ts`:**
```typescript
import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@repo/db';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const data: Prisma.UserCreateInput = {
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
    };

    return prisma.user.create({ data });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const data: Prisma.UserUpdateInput = {
      email: updateUserDto.email,
      name: updateUserDto.name,
    };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    return prisma.user.delete({ where: { id } });
  }
}
```

### 5.8 Edit User Controller

**`src/user/user.controller.ts`:**
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
```

### 5.9 Edit DTOs

**`src/user/dto/create-user.dto.ts`:**
```typescript
export class CreateUserDto {
  name?: string;
  email: string;
  password: string;
}
```

**`src/user/dto/update-user.dto.ts`:**
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### 5.10 Create `.env`

```bash
touch .env
```

**Content:**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
PORT=4000
```

### 5.11 Back to Root

```bash
cd ../..
```

---

## Step 6: Setup Next.js Web

### 6.1 Create Next.js App

```bash
cd apps

# Create Next.js app
npx create-next-app@latest web

# Interactive prompts:
# ✔ Would you like to use TypeScript? › Yes
# ✔ Would you like to use ESLint? › Yes
# ✔ Would you like to use Tailwind CSS? › Yes
# ✔ Would you like to use `src/` directory? › No
# ✔ Would you like to use App Router? › Yes
# ✔ Would you like to customize the default import alias? › No
```

### 6.2 Edit `package.json`

Add `@repo/db` dependency:

```json
{
  "name": "web",
  "dependencies": {
    "@repo/db": "^0.0.0",
    "next": "16.0.10",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "scripts": {
    "dev": "next dev --port 3000"
  }
}
```

### 6.3 Back to Root

```bash
cd ../..
```

---

## Step 7: Setup Shared Packages

### 7.1 TypeScript Config Package

```bash
cd packages/typescript-config

npm init -y
```

**`base.json`:**
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

**`nextjs.json`:**
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "incremental": true
  }
}
```

### 7.2 ESLint Config Package

```bash
cd ../eslint-config

npm init -y
```

**`package.json`:**
```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "base.js"
}
```

**`base.js`:**
```javascript
module.exports = {
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es6: true,
  },
};
```

### 7.3 Back to Root

```bash
cd ../..
```

---

## Step 8: Configure Database

### 8.1 Install All Dependencies

```bash
# From root
npm install
```

### 8.2 Setup Environment

Create `.env` in root:

```bash
touch .env
```

**Content:**
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
```

Copy to API:
```bash
cp .env apps/api/.env
```

### 8.3 Generate Prisma Client

```bash
# Generate Prisma Client
npm run db:generate

# Output should show:
# ✔ Generated Prisma Client to ./generated/prisma
```

### 8.4 Create Database

```bash
# Create PostgreSQL database
createdb mydb

# Or via psql
psql postgres
CREATE DATABASE mydb;
\q
```

### 8.5 Push Schema

```bash
cd packages/db

# Push schema to database
npx prisma db push

# Output should show:
# 🚀 Your database is now in sync with your Prisma schema.
```

### 8.6 Build Package

```bash
npm run build

cd ../..
```

---

## Step 9: First Run

### 9.1 Start Development

```bash
# From root
npm run dev
```

### 9.2 Test API

**Terminal baru:**

```bash
# Get users (should return empty array)
curl http://localhost:4000/users

# Create user
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }'

# Get users again
curl http://localhost:4000/users
```

### 9.3 Test Web

Open browser: http://localhost:3000

Should see Next.js default page.

---

## Step 10: Push to GitHub

### 10.1 Initialize Git

```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "feat: initial commit - turborepo monorepo with NestJS and Prisma"
```

### 10.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository (don't initialize with README)
3. Copy repository URL

### 10.3 Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/username/monorepo-nestjs-prisama.git

# Rename branch to main
git branch -M main

# Push
git push -u origin main
```

---

## Verification Checklist

- [ ] Turborepo running successfully
- [ ] NestJS API running on port 4000
- [ ] Next.js Web running on port 3000
- [ ] Prisma Client generated
- [ ] Database connected and schema pushed
- [ ] User CRUD endpoints working
- [ ] Password hashing working (bcrypt)
- [ ] Prisma Studio accessible
- [ ] Git repository pushed to GitHub

---

## Project Structure Final

```
monorepo-nestjs-prisama/
├── apps/
│   ├── api/                    # NestJS API (Port 4000)
│   │   ├── src/
│   │   │   ├── user/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── .env
│   │   └── package.json
│   └── web/                    # Next.js (Port 3000)
│       ├── app/
│       └── package.json
├── packages/
│   ├── db/                     # Prisma Package
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   ├── .env
│   │   └── package.json
│   ├── ui/                     # Shared UI
│   ├── typescript-config/      # TS Config
│   └── eslint-config/          # ESLint Config
├── .env                        # Root environment
├── .gitignore
├── turbo.json
├── package.json
└── README.md
```

---

## Next Steps

1. **Add More Models**: Edit `packages/db/prisma/schema.prisma`
2. **Create More API Endpoints**: Use `nest generate resource`
3. **Build Frontend UI**: Create pages in `apps/web/app`
4. **Add Authentication**: Implement JWT or session auth
5. **Add Testing**: Setup Jest for unit and E2E tests
6. **Setup CI/CD**: Configure GitHub Actions
7. **Deploy**: Deploy to Vercel, Railway, or AWS

---

## Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Build Time**: ~30-45 menit

**Last Updated**: December 17, 2025
