# NestJS API - Monorepo Backend

Backend API menggunakan NestJS framework yang terintegrasi dengan Prisma ORM dalam arsitektur monorepo Turborepo.

## 📋 Daftar Isi

- [Tentang Project](#tentang-project)
- [Instalasi NestJS](#instalasi-nestjs)
- [Integrasi dengan Prisma ORM](#integrasi-dengan-prisma-orm)
- [Menjalankan API](#menjalankan-api)
- [Struktur Project](#struktur-project)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Push ke GitHub](#push-ke-github)
- [Deployment](#deployment)

---

## Tentang Project

API ini merupakan bagian dari monorepo yang dikelola dengan Turborepo. Fitur utama:

- **Framework**: NestJS (Progressive Node.js framework)
- **Database**: PostgreSQL via Prisma ORM
- **Port**: 4000 (default)
- **TypeScript**: Full type safety
- **Password Security**: Bcrypt hashing
- **ID Strategy**: CUID (Collision-resistant Unique ID)

---

## Instalasi NestJS

### 1. Instalasi dari Scratch (Sudah Dilakukan)

Jika ingin membuat NestJS app baru dalam monorepo:

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Buat app baru di folder apps/
cd apps
nest new api

# Pilih npm sebagai package manager
```

### 2. Hapus Nested Git Repository

NestJS CLI otomatis membuat `.git` folder yang harus dihapus:

```bash
# Dari root monorepo
rm -rf apps/api/.git
```

### 3. Install Dependencies Project Ini

Jika clone repository ini:

```bash
# Dari root monorepo
npm install

# Atau hanya install dependencies API
cd apps/api
npm install
```

### 4. Tambahkan Dependencies untuk Prisma dan Bcrypt

```bash
cd apps/api

# Install dependencies
npm install bcrypt
npm install -D @types/bcrypt

# Update package.json untuk include @repo/db
# (sudah otomatis ter-link via npm workspaces)
```

**`package.json` dependencies:**

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@repo/db": "^0.0.0",
    "bcrypt": "^5.1.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2"
  }
}
```

---

## Integrasi dengan Prisma ORM

### 1. Import Prisma Client dari Package

NestJS API menggunakan Prisma Client dari shared package `@repo/db`:

**`src/user/user.service.ts`:**

```typescript
import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@repo/db';  // Import dari shared package
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
}
```

### 2. Load Environment Variables

**`src/main.ts`:**

```typescript
import 'dotenv/config';  // PENTING: Load .env sebelum import lainnya
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
```

### 3. Setup Environment Variables

Buat file `.env` di `apps/api/.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=4000
```

**Contoh:**

```bash
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"

# Prisma Cloud
DATABASE_URL="postgres://user:password@db.prisma.io:5432/postgres?sslmode=require"
```

### 4. Generate Prisma Client

Sebelum menjalankan API, generate Prisma Client:

```bash
# Dari root monorepo
npm run db:generate

# Atau dari packages/db
cd packages/db
npm run db:generate
npm run build
```

### 5. Push Database Schema

```bash
# Dari packages/db
cd packages/db
npx prisma db push
```

---

## Menjalankan API

### Development Mode

```bash
# Dari apps/api
npm run dev

# Atau dari root monorepo (jalankan semua apps)
npm run dev
```

API akan berjalan di `http://localhost:4000`

### Production Mode

```bash
# Build
npm run build

# Run production
npm run start:prod
```

### Watch Mode (Auto-reload)

```bash
npm run start:dev
```

---

## Struktur Project

```
apps/api/
├── src/
│   ├── user/                          # User Module
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts     # Data Transfer Object untuk create
│   │   │   └── update-user.dto.ts     # Data Transfer Object untuk update
│   │   ├── entities/
│   │   │   └── user.entity.ts         # User Entity
│   │   ├── user.controller.ts         # HTTP Routes & Handlers
│   │   ├── user.service.ts            # Business Logic + Prisma
│   │   └── user.module.ts             # Module Definition
│   ├── app.controller.ts              # Root Controller
│   ├── app.module.ts                  # Root Module
│   ├── app.service.ts                 # Root Service
│   └── main.ts                        # Entry Point (Bootstrap)
├── test/                              # E2E Tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env                               # Environment Variables
├── nest-cli.json                      # NestJS CLI Config
├── tsconfig.json                      # TypeScript Config
├── tsconfig.build.json                # Build Config
└── package.json                       # Dependencies
```

### File Penting

#### `src/main.ts` - Entry Point

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

#### `src/app.module.ts` - Root Module

```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule],  // Import User Module
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### `src/user/user.controller.ts` - HTTP Routes

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

#### `src/user/dto/create-user.dto.ts` - DTO

```typescript
export class CreateUserDto {
  name?: string;
  email: string;
  password: string;
}
```

---

## API Endpoints

Base URL: `http://localhost:4000`

### User Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/users` | Get all users | - |
| GET | `/users/:id` | Get user by ID | - |
| POST | `/users` | Create new user | `{ name, email, password }` |
| PATCH | `/users/:id` | Update user | `{ name?, email?, password? }` |
| DELETE | `/users/:id` | Delete user | - |

### Contoh Request

**1. Create User**

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }'
```

**Response:**
```json
{
  "id": "cl9ebqhxk00008eiu23muunhj",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-12-17T14:30:00.000Z",
  "updatedAt": "2025-12-17T14:30:00.000Z"
}
```

**2. Get All Users**

```bash
curl http://localhost:4000/users
```

**3. Get User by ID**

```bash
curl http://localhost:4000/users/cl9ebqhxk00008eiu23muunhj
```

**4. Update User**

```bash
curl -X PATCH http://localhost:4000/users/cl9ebqhxk00008eiu23muunhj \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

**5. Delete User**

```bash
curl -X DELETE http://localhost:4000/users/cl9ebqhxk00008eiu23muunhj
```

---

## Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

### Test File Example

**`src/user/user.service.spec.ts`:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## Push ke GitHub

### 1. Pastikan Tidak Ada Nested Git Repository

NestJS CLI membuat `.git` folder secara otomatis. Hapus sebelum push:

```bash
# Dari root monorepo
rm -rf apps/api/.git
```

### 2. Setup Gitignore

Pastikan file `.gitignore` di root sudah mencakup:

```gitignore
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.next/

# Environment variables
.env
.env.local
.env*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Turbo
.turbo/

# Testing
coverage/
```

### 3. Git Add & Commit

```bash
# Dari root monorepo
git add .

# Jika error "does not have a commit checked out", hapus nested .git:
# find . -name ".git" -type d -not -path "./.git" -exec rm -rf {} +

git commit -m "feat: add NestJS API with Prisma integration"
```

### 4. Push ke GitHub

**First time setup:**

```bash
# Create new repository di GitHub terlebih dahulu
# Kemudian:

git remote add origin https://github.com/username/repo-name.git
git branch -M main
git push -u origin main
```

**Update repository:**

```bash
git add .
git commit -m "your commit message"
git push
```

### 5. Troubleshooting: Nested Git Repository

Jika masih error:

```bash
# Cari semua nested .git folders
find . -name ".git" -type d

# Hapus semua kecuali root
find . -name ".git" -type d -not -path "./.git" -exec rm -rf {} +

# Kemudian git add lagi
git add .
git commit -m "fix: remove nested git repositories"
git push
```

---

## Deployment

### Vercel (Recommended untuk NestJS)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Init
railway init

# Deploy
railway up
```

### Docker

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main"]
```

**Build & Run:**

```bash
docker build -t nestjs-api .
docker run -p 4000:4000 --env-file .env nestjs-api
```

### Environment Variables di Production

Pastikan set environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Port aplikasi (default: 4000)
- `NODE_ENV`: production

---

## Troubleshooting

### 1. Error: "Cannot find module '@repo/db'"

```bash
# Rebuild package db
cd packages/db
npm run build

# Install ulang dari root
cd ../..
npm install
```

### 2. Error: "Database does not exist"

```bash
# Pastikan .env ada di apps/api/.env
cp .env apps/api/.env

# Push schema ke database
cd packages/db
npx prisma db push
```

### 3. Error: "Port 4000 already in use"

```bash
# Kill process di port 4000
lsof -ti:4000 | xargs kill -9

# Atau gunakan port lain
PORT=4001 npm run dev
```

### 4. Error saat Git Add

```bash
# Hapus nested git
rm -rf apps/api/.git

# Add lagi
git add .
```

---

## Scripts Cheatsheet

```bash
# Development
npm run dev                # Run in watch mode
npm run start              # Run normal
npm run start:debug        # Run with debugger

# Build
npm run build              # Build for production

# Production
npm run start:prod         # Run production build

# Testing
npm run test               # Unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage
npm run test:e2e           # E2E tests

# Linting
npm run lint               # Run ESLint
npm run format             # Format with Prettier
```

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## Support

Untuk pertanyaan atau dukungan:

- **NestJS Discord**: [https://discord.gg/G7Qnnhy](https://discord.gg/G7Qnnhy)
- **Prisma Discord**: [https://pris.ly/discord](https://pris.ly/discord)

---

## License

MIT

---

**Last Updated**: December 17, 2025
