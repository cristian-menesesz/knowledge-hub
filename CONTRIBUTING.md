# Contributing to Knowledge Hub Platform

Thank you for your interest in contributing to the Knowledge Hub Platform! This document provides
guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all
contributors to:

- **Be respectful**: Treat all community members with respect
- **Be inclusive**: Welcome diverse perspectives and experiences
- **Be collaborative**: Work together constructively
- **Be professional**: Maintain a professional demeanor in all interactions

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Other conduct that could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Git** for version control
- **GitHub CLI** (optional, for easier PR management)
- **Docker** (optional, for running services locally)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR_USERNAME/knowledge-hub.git
   cd knowledge-hub
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/cristian-menesesz/knowledge-hub.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Verify setup**:
   ```bash
   npm run build
   npm run lint
   npm run typecheck
   npm run test
   ```

### Project Structure

```
knowledge-hub/
├── apps/                      # Applications (services, frontends)
│   ├── services/             # Backend microservices
│   └── web/                  # Frontend applications
├── packages/                  # Shared packages
│   ├── design-system/        # UI component library
│   ├── shared-types/         # TypeScript types
│   └── utils/                # Utility functions
├── infrastructure/           # Infrastructure as Code
│   ├── terraform/           # Terraform configurations
│   └── kubernetes/          # K8s manifests
├── docs/                     # Documentation
└── .github/                  # GitHub workflows & templates
```

## 🔄 Development Workflow

### Feature-Based Workflow

**IMPORTANT**: All work must happen in feature branches. Never commit directly to `main` or
`develop`.

### Step-by-Step Process

#### 1. Sync with upstream

```bash
git checkout develop
git pull upstream develop
```

#### 2. Create feature branch

```bash
git checkout -b feature/task-id-short-description

# Examples:
git checkout -b feature/cms-001-block-editor
git checkout -b feature/auth-oauth-integration
git checkout -b bugfix/123-fix-validation
```

**Branch Naming Convention:**

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Emergency production fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation only changes
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

#### 3. Make changes

- Write code following our [coding standards](#coding-standards)
- Add tests for your changes
- Update documentation as needed
- Ensure all checks pass locally

#### 4. Commit your changes

```bash
git add .
git commit -m "feat(scope): description"
```

See [Commit Message Convention](#commit-message-convention) for details.

#### 5. Keep your branch updated

```bash
git fetch upstream
git rebase upstream/develop
```

#### 6. Push to your fork

```bash
git push origin feature/your-branch-name
```

#### 7. Create Pull Request

```bash
# Using GitHub CLI
gh pr create --base develop --fill

# Or via web interface
# Go to GitHub and click "New Pull Request"
```

#### 8. Address review feedback

- Make requested changes
- Commit and push updates
- Respond to comments

#### 9. Merge

Once approved, your PR will be merged using squash and merge.

## 💻 Coding Standards

### TypeScript Guidelines

#### Type Safety

- **Always use explicit types** for function parameters and return values
- **Enable strict mode** - already configured in tsconfig.json
- **Avoid `any`** - use `unknown` if type is truly unknown
- **Use type guards** for runtime type checking

```typescript
// ✅ Good
function processUser(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
  };
}

// ❌ Bad
function processUser(user: any): any {
  return {
    id: user.id,
    name: user.name,
  };
}
```

#### Interfaces vs Types

- **Use `interface`** for object shapes
- **Use `type`** for unions, intersections, and primitives

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

type Status = 'active' | 'inactive';

// ❌ Bad - inconsistent
type User = {
  id: string;
  name: string;
};

interface Status {
  value: 'active' | 'inactive';
}
```

### React Guidelines

#### Component Structure

```tsx
// Component.tsx
import React from 'react';
import styles from './Component.module.css';

interface ComponentProps {
  title: string;
  onAction?: (id: string) => void;
  variant?: 'primary' | 'secondary';
}

export const Component: React.FC<ComponentProps> = ({ title, onAction, variant = 'primary' }) => {
  // Hooks at the top
  const [state, setState] = React.useState<string>('');

  // Event handlers
  const handleClick = () => {
    onAction?.(state);
  };

  // Render
  return (
    <div className={styles.container} data-variant={variant}>
      <h2>{title}</h2>
      <button onClick={handleClick}>Action</button>
    </div>
  );
};
```

#### Hooks Usage

- **Use functional components** with hooks
- **Custom hooks** must start with `use`
- **Dependencies** must be complete in useEffect
- **Memoization** use when appropriate (useMemo, useCallback)

```typescript
// ✅ Good custom hook
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]); // Complete dependencies

  return { user, loading };
}
```

### Backend (NestJS) Guidelines

#### Service Structure

```typescript
@Injectable()
export class ContentService {
  constructor(
    private readonly repository: ContentRepository,
    private readonly cache: CacheService,
    private readonly logger: LoggerService
  ) {}

  async findOne(id: string): Promise<Content> {
    // Check cache
    const cached = await this.cache.get<Content>(`content:${id}`);
    if (cached) return cached;

    // Fetch from database
    const content = await this.repository.findById(id);
    if (!content) {
      throw new NotFoundException(`Content ${id} not found`);
    }

    // Cache result
    await this.cache.set(`content:${id}`, content, { ttl: 3600 });

    return content;
  }
}
```

#### DTOs and Validation

```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
```

### Code Style

- **Formatting**: Prettier (automatic via pre-commit hook)
- **Linting**: ESLint (automatic via pre-commit hook)
- **Line Length**: Max 100 characters
- **Indentation**: 2 spaces
- **Semicolons**: Required
- **Quotes**: Single quotes for strings
- **Trailing Commas**: Always (ES5+)

### Naming Conventions

#### Files

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Tests**: `*.test.ts` or `*.spec.ts`
- **Styles**: `*.module.css` for CSS modules

#### Code

- **Classes**: PascalCase (e.g., `UserService`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces**: PascalCase (e.g., `User`, not `IUser`)
- **Type Aliases**: PascalCase (e.g., `UserId`)

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockRepository;

  beforeEach(() => {
    repository = createMockRepository();
    service = new UserService(repository);
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const user = createMockUser();
      repository.findById.mockResolvedValue(user);

      const result = await service.findOne('123');

      expect(result).toEqual(user);
      expect(repository.findById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Coverage Requirements

- **Unit Tests**: Minimum 80% coverage for critical paths
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys

### Running Tests

```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage

# Watch mode (during development)
npm run test:watch
```

## 📝 Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI configuration changes
- **chore**: Other changes (maintenance)

### Scopes

Common scopes include:

- **Services**: `content-service`, `auth-service`, `comment-service`, etc.
- **Frontend**: `shell`, `content-reader`, `content-editor`, etc.
- **Packages**: `design-system`, `shared-types`, `utils`, etc.
- **Infrastructure**: `infra`, `ci`, `docker`, `k8s`, etc.
- **Documentation**: `docs`
- **Configuration**: `config`

### Examples

```bash
feat(content-service): add full-text search capability
fix(auth): resolve token refresh race condition
docs(readme): update installation instructions
test(comments): add unit tests for reply threading
refactor(cache): extract Redis logic to separate service
perf(content-reader): optimize image lazy loading
build(deps): upgrade React to v18.3.0
ci(github-actions): add security scanning workflow
chore(lint): fix ESLint warnings
```

### Breaking Changes

Add `!` after type/scope and include `BREAKING CHANGE:` in footer:

```
feat(api)!: change content response format

BREAKING CHANGE: The API now returns `publishedAt` instead of `published_at`
```

### Git Hooks

Our pre-commit hooks will validate your commit message format automatically.

## 🔍 Pull Request Process

### Before Creating PR

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass locally
- [ ] No linter warnings
- [ ] Type check passes

### PR Title

Use the same format as commit messages:

```
feat(scope): description
fix(scope): description
docs(scope): description
```

### PR Description Template

Our PR template will automatically include:

- **Description**: What changes were made and why
- **Related Tasks**: Links to issues/tasks
- **Type of Change**: Feature, bugfix, documentation, etc.
- **Testing**: How you tested the changes
- **Screenshots**: For UI changes
- **Checklist**: Pre-merge verification

### Review Process

1. **Automated Checks**: All CI checks must pass
   - Linting
   - Type checking
   - Unit tests
   - Build verification

2. **Code Review**: Self-review (solo developer mode)
   - Review the diff carefully
   - Check for any issues
   - Verify documentation is updated

3. **Approval**: Can self-approve (solo developer mode)

4. **Merge**: Use squash and merge for clean history

### After Merge

- Delete the feature branch
- Pull latest develop
- Start next feature from updated develop

```bash
git checkout develop
git pull upstream develop
git branch -d feature/your-branch
```

## 📚 Documentation

### Code Documentation

#### TSDoc Comments

````typescript
/**
 * Fetches user by ID from the database or cache
 *
 * @param id - The user's unique identifier
 * @returns Promise resolving to User or null if not found
 * @throws {NotFoundException} When user doesn't exist
 *
 * @example
 * ```typescript
 * const user = await userService.findOne('user-123');
 * ```
 */
async findOne(id: string): Promise<User | null> {
  // Implementation
}
````

#### README Files

Every service, app, and package should have a README:

- Use provided templates in `.github/README_TEMPLATE_*.md`
- Include quick start guide
- Document API endpoints
- Provide examples
- List dependencies

### Architecture Decision Records (ADRs)

For significant architectural decisions, create an ADR in `docs/adr/`:

```markdown
# ADR-001: Use PostgreSQL for Primary Database

## Status

Accepted

## Context

We need to choose a primary database for content and user data.

## Decision

We will use PostgreSQL as the primary relational database.

## Consequences

**Positive:**

- ACID compliance
- Rich feature set
- Strong community support

**Negative:**

- Requires more resources than lightweight alternatives
- Complex query optimization
```

## 🌟 Best Practices

### Security

- **Never commit secrets** - use environment variables
- **Validate all inputs** - use DTOs with class-validator
- **Sanitize outputs** - prevent XSS attacks
- **Use parameterized queries** - prevent SQL injection
- **Keep dependencies updated** - regularly update packages

### Performance

- **Use caching** - Redis for frequently accessed data
- **Implement pagination** - don't return all results at once
- **Optimize database queries** - use proper indexes
- **Lazy load** - defer loading of non-critical resources
- **Memoize expensive operations** - use useMemo, useCallback

### Accessibility

- **Semantic HTML** - use proper HTML elements
- **ARIA labels** - for dynamic content
- **Keyboard navigation** - all interactive elements
- **Color contrast** - WCAG AA minimum
- **Screen reader support** - test with screen readers

## 🐛 Reporting Bugs

### Before Reporting

- Check if the issue already exists
- Verify it's reproducible
- Gather relevant information

### Bug Report Template

Use GitHub Issues with this information:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, browser, etc.
- **Screenshots**: If applicable
- **Logs**: Relevant error logs

## 💡 Suggesting Features

### Feature Request Template

- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Alternative approaches considered
- **Benefits**: Who benefits and how?
- **Implementation**: High-level implementation approach

## 👥 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Pull Requests**: Code contributions and reviews

### Getting Help

- Review existing documentation
- Search GitHub Issues
- Ask in GitHub Discussions
- Tag maintainers if urgent

## 📄 License

By contributing to Knowledge Hub Platform, you agree that your contributions will be licensed under
the MIT License.

## 🙏 Recognition

All contributors will be recognized in:

- Project README
- Release notes
- Contributors page (when available)

---

**Thank you for contributing to Knowledge Hub Platform!** 🎉

If you have questions about contributing, please open a GitHub Discussion or reach out to the
maintainers.

**Last Updated**: January 25, 2026
