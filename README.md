# Turborepo Monorepo - NestJS + Prisma ORM

Modern monorepo starter template menggunakan Turborepo, NestJS, Next.js, dan Prisma ORM dengan TypeScript.

## 🚀 Overview

Project ini adalah **production-ready monorepo** yang menggabungkan backend API (NestJS) dan frontend web (Next.js) dalam satu repository dengan shared packages. Dirancang untuk scalability, maintainability, dan developer experience yang optimal.

### 🎯 Fitur Utama

- ✅ **Monorepo Architecture** - Kelola multiple apps dan packages dalam satu repository
- ✅ **Type-Safe Database** - Prisma ORM dengan full TypeScript support
- ✅ **RESTful API** - NestJS backend dengan CRUD operations
- ✅ **Modern Frontend** - Next.js 14+ dengan App Router
- ✅ **Password Security** - Bcrypt hashing untuk user authentication
- ✅ **Hot Reload** - Fast refresh untuk development
- ✅ **Shared Packages** - Reusable code across apps
- ✅ **Build Optimization** - Turborepo caching dan parallel execution

---

## 📦 Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| [Turborepo](https://turbo.build/repo) | ^2.6.3 | Monorepo build system |
| [TypeScript](https://www.typescriptlang.org/) | 5.9.2 | Type-safe development |
| [Node.js](https://nodejs.org/) | >= 18.x | Runtime environment |
| [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) | - | Package management |

### Backend (API)

| Technology | Version | Purpose |
|------------|---------|---------|
| [NestJS](https://nestjs.com/) | ^11.0.1 | Backend framework |
| [Prisma ORM](https://www.prisma.io/) | ^7.0.0 | Database toolkit |
| [PostgreSQL](https://www.postgresql.org/) | >= 14.x | Database |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | ^5.1.1 | Password hashing |

### Frontend (Web)

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.0.10 | React framework |
| [React](https://react.dev/) | ^19.2.0 | UI library |
| [Tailwind CSS](https://tailwindcss.com/) | - | Styling (optional) |

### Shared Packages

- **@repo/db** - Prisma Client dan database utilities
- **@repo/ui** - Shared UI components
- **@repo/typescript-config** - Shared TypeScript configurations
- **@repo/eslint-config** - Shared ESLint rules

---

## 📁 Project Structure

```
monorepo-nestjs-prisama/
├── apps/
│   ├── api/                    # NestJS API (Port 4000)
│   │   ├── src/
│   │   │   ├── user/          # User CRUD module
│   │   │   └── main.ts
│   │   └── package.json
│   └── web/                    # Next.js App (Port 3000)
│       ├── app/
│       └── package.json
├── packages/
│   ├── db/                     # Prisma ORM Package
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   ├── ui/                     # Shared UI Components
│   ├── typescript-config/      # Shared TS Config
│   └── eslint-config/          # Shared ESLint Config
├── SETUP-CLONE.md             # Setup via git clone
├── SETUP-SCRATCH.md           # Setup from scratch
├── SETUP.md                   # Complete documentation
├── turbo.json
└── package.json
```

---

## 🚀 Quick Start

Pilih salah satu metode setup:

### 📥 Option 1: Clone Existing Project (10-15 menit)

Untuk developer yang ingin setup project yang sudah ada:

**→ [Setup via Git Clone - Quick Start Guide](./SETUP-CLONE.md)**

```bash
# Quick preview
git clone <repository-url>
cd monorepo-nestjs-prisama
npm install
cp .env.example .env  # Edit DATABASE_URL
npm run db:generate
npm run dev
```

### 🔨 Option 2: Build from Scratch (30-45 menit)

Untuk developer yang ingin membuat monorepo baru dari nol:

**→ [Setup from Scratch - Complete Build Guide](./SETUP-SCRATCH.md)**

```bash
# Quick preview
npx create-turbo@latest
# ... follow step-by-step guide
```

### 📚 Option 3: Complete Documentation

Untuk referensi lengkap dan troubleshooting:

**→ [Complete Setup Documentation](./SETUP.md)**

---

## 📖 Documentation

### Setup Guides

| Document | Description | Estimated Time |
|----------|-------------|----------------|
| **[SETUP-CLONE.md](./SETUP-CLONE.md)** | Quick start untuk clone & run project | 10-15 menit |
| **[SETUP-SCRATCH.md](./SETUP-SCRATCH.md)** | Build monorepo dari scratch | 30-45 menit |
| **[SETUP.md](./SETUP.md)** | Dokumentasi lengkap & troubleshooting | Reference |

### Component Documentation

| Document | Description |
|----------|-------------|
| **[apps/api/README.md](./apps/api/README.md)** | NestJS API documentation |
| **[packages/db/README.md](./packages/db/README.md)** | Prisma ORM package guide |

---

## 🎯 Features & Capabilities

### Backend API (NestJS)

- ✅ RESTful API architecture
- ✅ User CRUD operations dengan UUID (CUID)
- ✅ Password hashing dengan bcrypt (salt rounds: 10)
- ✅ Type-safe database queries dengan Prisma
- ✅ Auto-generated API documentation
- ✅ Error handling dan validation
- ✅ Environment-based configuration

### Database (Prisma ORM)

- ✅ PostgreSQL dengan type-safe client
- ✅ Auto-generated TypeScript types
- ✅ Migration system untuk version control
- ✅ Prisma Studio untuk database GUI
- ✅ Connection pooling dengan pg adapter
- ✅ CUID untuk unique identifiers

### Frontend (Next.js)

- ✅ App Router dengan Server Components
- ✅ Server Actions untuk mutations
- ✅ Shared components dari `@repo/ui`
- ✅ Type-safe dengan TypeScript
- ✅ Hot reload development

### Monorepo (Turborepo)

- ✅ Parallel task execution
- ✅ Smart caching untuk build optimization
- ✅ Shared dependencies management
- ✅ Workspace-aware scripts
- ✅ Pipeline orchestration

---

## 🔧 Development

### Prerequisites

- Node.js >= 18.x
- npm >= 11.x
- PostgreSQL >= 14.x
- Git

### Install Dependencies

```bash
npm install
```

### Environment Setup

```bash
# Create .env file
cp .env.example .env

# Edit DATABASE_URL
# DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Copy to API
cp .env apps/api/.env
```

### Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
cd packages/db
npx prisma db push
```

### Run Development

```bash
# Run all apps
npm run dev

# API: http://localhost:4000
# Web: http://localhost:3000
```

### Build Production

```bash
npm run build
```

---

## 📡 API Endpoints

Base URL: `http://localhost:4000`

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (without password) |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Example Request

```bash
# Create user
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secret123"
  }'

# Response
{
  "id": "cl9ebqhxk00008eiu23muunhj",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-12-17T14:30:00.000Z",
  "updatedAt": "2025-12-17T14:30:00.000Z"
}
```

---

## 🛠️ Scripts

### Root Commands

```bash
npm run dev              # Run all apps in development mode
npm run build            # Build all apps and packages
npm run db:generate      # Generate Prisma Client
npm run db:deploy        # Deploy database migrations
npm run db:studio        # Open Prisma Studio GUI
npm run lint             # Lint all projects
npm run format           # Format code with Prettier
```

### Package-Specific Commands

```bash
# API
cd apps/api
npm run dev              # Run API in watch mode
npm run build            # Build for production
npm run start:prod       # Run production build
npm run test             # Run tests

# Web
cd apps/web
npm run dev              # Run Next.js dev server
npm run build            # Build for production
npm run start            # Run production server

# Database
cd packages/db
npm run build            # Build package
npm run db:generate      # Generate Prisma Client
npx prisma studio        # Open Prisma Studio
```

---

## 🧪 Testing

```bash
# Unit tests
cd apps/api
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🚢 Deployment

### Vercel (Recommended for Next.js)

```bash
npm i -g vercel
vercel
```

### Railway (Full-stack)

```bash
npm i -g @railway/cli
railway init
railway up
```

### Docker

```bash
docker build -t monorepo-app .
docker run -p 4000:4000 -p 3000:3000 monorepo-app
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot find module '@repo/db'` | Run `npm run db:generate && cd packages/db && npm run build` |
| `Database does not exist` | Create database: `createdb mydb` |
| `Port 4000 already in use` | Kill process: `lsof -ti:4000 \| xargs kill -9` |
| `Prisma Client outdated` | Re-generate: `npm run db:generate` |

**→ [See complete troubleshooting guide](./SETUP.md#troubleshooting)**

---

## 📚 Learn More

### Official Documentation

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Community & Support

- [Turborepo Discord](https://turbo.build/discord)
- [NestJS Discord](https://discord.gg/G7Qnnhy)
- [Prisma Discord](https://pris.ly/discord)

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Turborepo Team](https://turbo.build/) - Monorepo tooling
- [Vercel](https://vercel.com/) - Deployment platform
- [NestJS Community](https://nestjs.com/) - Backend framework
- [Prisma Team](https://www.prisma.io/) - Database toolkit

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/username/monorepo-nestjs-prisama/issues)
- **Discussions**: [GitHub Discussions](https://github.com/username/monorepo-nestjs-prisama/discussions)

---

## 🗺️ Roadmap

- [ ] Authentication & Authorization (JWT)
- [ ] Role-based access control (RBAC)
- [ ] File upload support
- [ ] WebSocket integration
- [ ] GraphQL API option
- [ ] Docker Compose setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] E2E testing setup
- [ ] Performance monitoring
- [ ] API documentation (Swagger)

---

**Made with ❤️ using Turborepo, NestJS, and Prisma**

**Last Updated**: December 17, 2025
