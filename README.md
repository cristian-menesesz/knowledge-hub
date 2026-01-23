# Knowledge Hub Platform

A microservices-based knowledge management platform with microfrontend architecture, featuring
content management, real-time discussions, interactive code playgrounds, and comprehensive
analytics.

## 🚀 Project Status

**Current Phase**: Phase 0 - Foundation & Setup  
**Version**: 0.1.0  
**Last Updated**: January 23, 2026

## 📋 Architecture

### Microservices

- **Content Service** (Node.js/NestJS + Rust)
- **User/Auth Service** (Node.js/NestJS)
- **Comment/Discussion Service** (Node.js/NestJS + Rust WebSocket)
- **Media/Asset Service** (Go)
- **Search Service** (Meilisearch)
- **Analytics Service** (Rust + ClickHouse)
- **API Gateway** (Kong)

### Microfrontends

- **Shell/Host** (React + Webpack 5 Module Federation)
- **Content Reader** (React)
- **Content Editor** (React)
- **Admin Dashboard** (React/Vue)
- **Search & Discovery** (React)
- **Discussion** (React/Svelte)
- **Playground** (React)

### Data Layer

- PostgreSQL (structured data)
- MongoDB (flexible documents)
- Redis (caching & sessions)
- Elasticsearch (search)
- InfluxDB/TimescaleDB (time-series)

## 📁 Repository Structure

```
knowledge-hub/
├── apps/                    # Applications (services & microfrontends)
│   ├── services/           # Backend microservices
│   │   ├── content-service/
│   │   ├── auth-service/
│   │   ├── comment-service/
│   │   ├── media-service/
│   │   ├── search-service/
│   │   └── analytics-service/
│   └── mfe/               # Microfrontends
│       ├── shell/
│       ├── content-reader/
│       ├── content-editor/
│       ├── admin-dashboard/
│       ├── search/
│       ├── discussion/
│       └── playground/
├── packages/               # Shared packages
│   ├── design-system/     # UI component library
│   ├── shared-types/      # TypeScript types
│   ├── utils/            # Utility functions
│   ├── api-client/       # API client library
│   ├── config/           # Shared configuration
│   ├── eslint-config/    # ESLint configuration
│   └── tsconfig/         # TypeScript configuration
├── infrastructure/        # Infrastructure as Code
│   ├── terraform/        # Terraform configurations
│   ├── kubernetes/       # K8s manifests
│   ├── helm/            # Helm charts
│   ├── docker/          # Dockerfiles
│   └── scripts/         # Deployment scripts
├── docs/                 # Documentation
│   ├── adr/             # Architecture Decision Records
│   ├── runbooks/        # Operational runbooks
│   ├── api/             # API documentation
│   ├── architecture/    # Architecture diagrams
│   └── guides/          # Development guides
├── .github/             # GitHub configuration
│   └── workflows/       # CI/CD workflows
├── DEVELOPMENT_CHECKLIST.md  # Development roadmap
└── README.md            # This file
```

## 🛠️ Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** >= 24.0.0
- **Docker Compose** >= 2.20.0
- **Git** >= 2.40.0

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/knowledge-hub.git
cd knowledge-hub
```

### 2. Install Dependencies

```bash
npm install
```

This will:

- Install all workspace dependencies
- Set up Husky git hooks
- Configure pre-commit and pre-push hooks

### 3. Set Up Git Hooks

```bash
npm run prepare
```

### 4. Development

```bash
# Run all services in development mode
npm run dev

# Build all packages and services
npm run build

# Run tests
npm run test              # All tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests only
npm run test:e2e         # E2E tests only

# Linting and formatting
npm run lint             # Run linter
npm run lint:fix         # Fix linting issues
npm run format           # Format all files
npm run format:check     # Check formatting

# Type checking
npm run typecheck        # Check TypeScript types
```

## 📝 Git Workflow

We follow a **trunk-based development** workflow with feature branches.

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): format code
refactor(scope): refactor code
test(scope): add tests
chore(scope): update dependencies
```

**Examples:**

```bash
feat(content-editor): add block-based editor
fix(auth-service): resolve token refresh issue
docs(readme): update installation instructions
```

See [Git Workflow Documentation](./docs/GIT_WORKFLOW.md) for detailed guidelines.

## 🧪 Testing

### Test Pyramid

- **Unit Tests**: 70% coverage target
- **Integration Tests**: 20% coverage target
- **E2E Tests**: 10% coverage target

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests (requires Docker)
npm run test:integration

# E2E tests (requires running application)
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📦 Monorepo Management

This project uses **Turborepo** for monorepo management.

### Key Features

- **Incremental builds** - Only rebuild what changed
- **Remote caching** - Share build cache across team
- **Parallel execution** - Run tasks concurrently
- **Task pipelines** - Define task dependencies

### Turborepo Commands

```bash
# Run task in all workspaces
turbo run build

# Run task in specific workspace
turbo run build --filter=content-service

# Run with cache disabled
turbo run build --force

# Clear cache
turbo run clean
```

## 🔧 Configuration Files

- **`turbo.json`** - Turborepo configuration
- **`tsconfig.json`** - TypeScript base configuration
- **`.eslintrc.js`** - ESLint configuration
- **`.prettierrc.json`** - Prettier configuration
- **`commitlint.config.js`** - Commit message linting
- **`.husky/`** - Git hooks
- **`docker-compose.yml`** - Local development services

## 📚 Documentation

- [Development Checklist](./DEVELOPMENT_CHECKLIST.md) - Complete development roadmap
- [Git Workflow](./docs/GIT_WORKFLOW.md) - Branching strategy and conventions
- [Architecture Decision Records](./docs/adr/) - Design decisions and rationale
- [API Documentation](./docs/api/) - REST, GraphQL, gRPC documentation
- [Runbooks](./docs/runbooks/) - Operational procedures

## 🤝 Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process
for submitting pull requests.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit using conventional commits (`git commit -m 'feat(scope): add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 👥 Team

- **Project Lead**: [Name]
- **Backend Team**: [Names]
- **Frontend Team**: [Names]
- **DevOps**: [Name]

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/knowledge-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/knowledge-hub/discussions)
- **Email**: support@knowledge-hub.dev

## 🗺️ Roadmap

See [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) for the complete development roadmap.

### Current Milestones

- ✅ **Phase 0**: Foundation & Setup (Weeks 1-4) - **IN PROGRESS**
- ⬜ **Phase 1**: Core Infrastructure & Design System (Weeks 5-10)
- ⬜ **MVP Release**: Basic CMS + Auth (Week 18)
- ⬜ **Alpha Release**: + Search + Comments (Week 30)
- ⬜ **Beta Release**: + GraphQL + K8s (Week 48)
- ⬜ **V1.0 Launch**: Production Ready (Week 62)

---

**Built with ❤️ by the Knowledge Hub team**
