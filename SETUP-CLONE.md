# Setup via Git Clone - Quick Start Guide

Panduan lengkap untuk setup project monorepo Turborepo + NestJS + Prisma ORM melalui git clone.

## 📋 Daftar Isi

- [Prerequisites](#prerequisites)
- [Step 1: Clone Repository](#step-1-clone-repository)
- [Step 2: Install Dependencies](#step-2-install-dependencies)
- [Step 3: Setup Database](#step-3-setup-database)
- [Step 4: Konfigurasi Environment](#step-4-konfigurasi-environment)
- [Step 5: Generate Prisma Client](#step-5-generate-prisma-client)
- [Step 6: Jalankan Project](#step-6-jalankan-project)
- [Verifikasi Setup](#verifikasi-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Pastikan sistem Anda sudah terinstall:

- **Node.js**: >= 18.x (Recommended: v20.x)
- **npm**: >= 11.x
- **PostgreSQL**: >= 14.x (atau akses ke database PostgreSQL cloud)
- **Git**: Latest version

### Cek Versi

```bash
node --version  # v20.19.5
npm --version   # 11.6.2
git --version   # 2.x.x
```

---

## Step 1: Clone Repository

Clone repository dari GitHub:

```bash
# Clone dengan HTTPS
git clone https://github.com/username/monorepo-nestjs-prisama.git

# Atau dengan SSH
git clone git@github.com:username/monorepo-nestjs-prisama.git

# Masuk ke folder project
cd monorepo-nestjs-prisama
```

### Struktur Project

Setelah clone, struktur folder akan seperti ini:

```
monorepo-nestjs-prisama/
├── apps/
│   ├── api/          # NestJS API Backend
│   └── web/          # Next.js Frontend
├── packages/
│   ├── db/           # Prisma ORM Package
│   ├── ui/           # Shared UI Components
│   ├── typescript-config/
│   └── eslint-config/
├── turbo.json
├── package.json
└── README.md
```

---

## Step 2: Install Dependencies

Install semua dependencies untuk monorepo:

```bash
npm install
```

Proses ini akan:
- Install dependencies di root project
- Install dependencies di semua apps (`apps/*`)
- Install dependencies di semua packages (`packages/*`)
- Link workspace packages secara otomatis

**Estimasi waktu**: 2-5 menit (tergantung koneksi internet)

### Verifikasi Instalasi

```bash
# Cek apakah node_modules terinstall
ls -la node_modules

# Cek workspace packages ter-link
npm list @repo/db --depth=0
```

---

## Step 3: Setup Database

### Opsi A: PostgreSQL Lokal

Jika menggunakan PostgreSQL lokal:

```bash
# Start PostgreSQL (Mac)
brew services start postgresql@14

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Buat database baru
createdb mydb

# Atau via psql
psql postgres
CREATE DATABASE mydb;
\q
```

### Opsi B: PostgreSQL Cloud

Gunakan salah satu provider:

- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)
- **Railway**: https://railway.app (Free tier available)
- **Render**: https://render.com (Free tier available)

Setelah setup, copy **connection string** dari dashboard provider.

---

## Step 4: Konfigurasi Environment

### 4.1 Buat File `.env` di Root

```bash
# Buat file .env di root project
touch .env
```

Edit `.env` dan tambahkan:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Contoh:**

```bash
# PostgreSQL Lokal
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"

# Neon
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb"

# Railway
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:7432/railway"
```

### 4.2 Copy `.env` ke `apps/api`

```bash
# Copy .env ke folder api
cp .env apps/api/.env
```

> **⚠️ Penting**: NestJS berjalan dari folder `apps/api`, jadi butuh file `.env` di sana.

### 4.3 Verifikasi `.env`

```bash
# Cek apakah file .env ada
ls -la .env
ls -la apps/api/.env

# Lihat isi (pastikan DATABASE_URL sama)
cat .env
cat apps/api/.env
```

---

## Step 5: Generate Prisma Client

### 5.1 Push Schema ke Database

```bash
# Dari root project
cd packages/db

# Push schema (create tables)
npx prisma db push
```

Output yang diharapkan:
```
🚀 Your database is now in sync with your Prisma schema. Done in 2.5s
```

### 5.2 Generate Prisma Client

```bash
# Generate TypeScript types
npm run db:generate
```

Output yang diharapkan:
```
✔ Generated Prisma Client to ./generated/prisma in 20ms
```

### 5.3 Build Package DB

```bash
# Build @repo/db package
npm run build
```

Output yang diharapkan:
```
ESM Build start
ESM dist/index.mjs 5.51 KB
ESM ⚡️ Build success in 70ms
```

### 5.4 Kembali ke Root

```bash
cd ../..
```

---

## Step 6: Jalankan Project

### Opsi A: Jalankan Semua Apps (Recommended)

```bash
# Dari root project
npm run dev
```

Ini akan menjalankan:
- **API**: http://localhost:4000
- **Web**: http://localhost:3000

### Opsi B: Jalankan Apps Terpisah

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Web:**
```bash
cd apps/web
npm run dev
```

### Output yang Diharapkan

**API (Port 4000):**
```
=== DEBUG INFO ===
CWD: /path/to/monorepo-nestjs-prisama/apps/api
ENV Path: /path/to/monorepo-nestjs-prisama/apps/api/.env
DATABASE_URL: postgresql://...
==================
[Nest] 12345  - LOG [NestApplication] Nest application successfully started
```

**Web (Port 3000):**
```
- Local:   http://localhost:3000
- Ready in 1.5s
```

---

## Verifikasi Setup

### 1. Test API Endpoint

```bash
# Get all users
curl http://localhost:4000/users
```

**Response yang diharapkan:**
```json
[]
```

### 2. Create User

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "secret123"
  }'
```

**Response yang diharapkan:**
```json
{
  "id": "cl9ebqhxk00008eiu23muunhj",
  "name": "Test User",
  "email": "test@example.com",
  "createdAt": "2025-12-17T14:30:00.000Z",
  "updatedAt": "2025-12-17T14:30:00.000Z"
}
```

### 3. Get Users Again

```bash
curl http://localhost:4000/users
```

**Response yang diharapkan:**
```json
[
  {
    "id": "cl9ebqhxk00008eiu23muunhj",
    "name": "Test User",
    "email": "test@example.com",
    "createdAt": "2025-12-17T14:30:00.000Z",
    "updatedAt": "2025-12-17T14:30:00.000Z"
  }
]
```

### 4. Open Prisma Studio

```bash
# Dari root
npm run db:studio
```

Akan membuka GUI di http://localhost:5555 untuk melihat data di database.

### 5. Check Web App

Buka browser dan akses http://localhost:3000 - seharusnya muncul homepage Next.js.

---

## Troubleshooting

### Error: "Cannot find module '@repo/db'"

**Penyebab**: Package `@repo/db` belum di-build.

**Solusi:**
```bash
cd packages/db
npm run db:generate
npm run build
cd ../..
npm install
```

### Error: "Database does not exist"

**Penyebab**: DATABASE_URL salah atau database belum dibuat.

**Solusi:**
```bash
# Cek DATABASE_URL
cat .env
cat apps/api/.env

# Pastikan kedua file sama
cp .env apps/api/.env

# Buat database jika belum ada
createdb mydb

# Push schema lagi
cd packages/db
npx prisma db push
```

### Error: "Port 4000 already in use"

**Penyebab**: Port sudah digunakan oleh process lain.

**Solusi:**
```bash
# Kill process di port 4000
lsof -ti:4000 | xargs kill -9

# Atau gunakan port lain
PORT=4001 npm run dev
```

### Error: "Prisma Client validation error"

**Penyebab**: Prisma Client outdated.

**Solusi:**
```bash
cd packages/db
npm run db:generate
npm run build
cd ../..
# Restart server
```

### Error: "Can't reach database server"

**Penyebab**: Database tidak running atau connection string salah.

**Solusi:**

**PostgreSQL Lokal:**
```bash
# Mac
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Check status
pg_isready
```

**PostgreSQL Cloud:**
- Cek dashboard provider
- Pastikan database tidak suspended
- Cek firewall/whitelist IP

### Dependencies Installation Gagal

**Solusi:**
```bash
# Clear cache
npm cache clean --force

# Hapus node_modules dan lock file
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Install ulang
npm install
```

### Hot Reload Tidak Bekerja

**Solusi:**
```bash
# Clear Turbo cache
rm -rf .turbo
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

---

## Next Steps

Setelah setup berhasil:

1. **Explore API Endpoints**: Lihat `apps/api/README.md` untuk dokumentasi API lengkap

2. **Setup IDE**: 
   - Install extension TypeScript
   - Install extension Prisma
   - Restart TypeScript server: Cmd+Shift+P → "TypeScript: Restart TS Server"

3. **Explore Prisma Studio**: 
   ```bash
   npm run db:studio
   ```

4. **Read Documentation**:
   - `SETUP.md` - Dokumentasi lengkap monorepo
   - `apps/api/README.md` - Dokumentasi NestJS API
   - `packages/db/README.md` - Dokumentasi Prisma ORM

5. **Development Workflow**:
   - Edit code di `apps/api/src` atau `apps/web`
   - Server akan auto-reload
   - Jika ubah Prisma schema, jalankan: `npm run db:generate`

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Jalankan semua apps
cd apps/api && npm run dev     # Jalankan API saja
cd apps/web && npm run dev     # Jalankan Web saja

# Database
npm run db:generate            # Generate Prisma Client
npm run db:studio              # Open Prisma Studio
cd packages/db && npx prisma db push  # Push schema

# Build
npm run build                  # Build semua
cd apps/api && npm run build   # Build API
cd apps/web && npm run build   # Build Web

# Testing
cd apps/api && npm run test    # Run tests
```

---

## Support

Jika masih ada masalah:

1. **Check Logs**: Lihat output console untuk error details
2. **Verify Environment**: Pastikan semua prerequisites terinstall
3. **Check Documentation**: Baca `SETUP.md` untuk detail lebih lanjut
4. **GitHub Issues**: Buka issue di repository

---

**Setup Time**: ~10-15 menit

**Last Updated**: December 17, 2025
