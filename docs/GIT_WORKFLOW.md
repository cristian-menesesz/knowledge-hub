# Git Workflow & Branching Strategy

## Branch Structure

### Main Branches

- **`main`** - Production-ready code
  - Protected branch
  - Requires pull request with approvals
  - All tests must pass
  - Deploys to production
  - Tagged with semantic versions (v1.0.0, v1.1.0, etc.)

- **`develop`** - Integration branch
  - Protected branch
  - Requires pull request with approvals
  - All tests must pass
  - Deploys to staging environment
  - Always ahead of main

### Supporting Branches

- **`feature/*`** - Feature development
  - Branch from: `develop`
  - Merge back to: `develop`
  - Naming: `feature/task-id-short-description`
  - Examples: `feature/cms-001-block-editor`, `feature/auth-oauth-integration`

- **`bugfix/*`** - Bug fixes during development
  - Branch from: `develop`
  - Merge back to: `develop`
  - Naming: `bugfix/issue-id-description`
  - Examples: `bugfix/123-fix-login-validation`

- **`hotfix/*`** - Urgent production fixes
  - Branch from: `main`
  - Merge back to: `main` AND `develop`
  - Naming: `hotfix/version-description`
  - Examples: `hotfix/1.0.1-security-patch`

- **`release/*`** - Release preparation
  - Branch from: `develop`
  - Merge back to: `main` AND `develop`
  - Naming: `release/version`
  - Examples: `release/1.0.0`, `release/2.0.0-beta`

## Workflow Steps

### Starting New Feature

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/cms-001-block-editor

# Work on feature...
git add .
git commit -m "feat(content-editor): add block registry system"

# Push to remote
git push -u origin feature/cms-001-block-editor
```

### Creating Pull Request

1. Push your feature branch to remote
2. Create PR from feature branch to `develop`
3. Fill out PR template with:
   - Description of changes
   - Related task IDs (CMS-001, etc.)
   - Screenshots (if UI changes)
   - Testing checklist
4. Request reviews from team members
5. Ensure all CI checks pass
6. Address review comments
7. Squash and merge once approved

### Hotfix Process

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1-security-patch

# Make fix
git add .
git commit -m "fix(auth): patch JWT vulnerability"

# Push and create PR to main
git push -u origin hotfix/1.0.1-security-patch

# After merging to main, merge to develop
git checkout develop
git merge hotfix/1.0.1-security-patch
git push origin develop
```

### Release Process

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/1.0.0

# Update version numbers, changelog, etc.
npm version 1.0.0
git add .
git commit -m "chore(release): prepare v1.0.0"

# Create PR to main
git push -u origin release/1.0.0

# After approval and merge to main
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Merge back to develop
git checkout develop
git merge release/1.0.0
git push origin develop
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependencies
- **ci**: CI configuration
- **chore**: Other changes (maintenance)
- **revert**: Revert previous commit

### Scopes

- `content-service`
- `auth-service`
- `comment-service`
- `media-service`
- `search-service`
- `analytics-service`
- `gateway`
- `shell`
- `content-reader`
- `content-editor`
- `admin-dashboard`
- `search-mfe`
- `discussion-mfe`
- `playground-mfe`
- `design-system`
- `deps`
- `config`
- `infra`
- `docs`
- `ci`

### Examples

```bash
feat(content-editor): add drag-and-drop block reordering
fix(auth-service): resolve token refresh race condition
docs(readme): update installation instructions
test(comments): add E2E tests for threaded replies
refactor(cache): extract Redis logic to separate service
perf(content-reader): optimize image loading
build(deps): upgrade React to v18.3.0
ci(github-actions): add security scanning workflow
```

### Breaking Changes

If commit introduces breaking changes, add `BREAKING CHANGE:` in footer:

```
feat(api)!: change content API response format

BREAKING CHANGE: The content API now returns `publishedAt` instead of `published_at`
```

## Branch Protection Rules

### Main Branch

- ✅ Require pull request before merging
- ✅ Require 2 approvals
- ✅ Require status checks to pass
  - Linting
  - Type checking
  - Unit tests
  - Integration tests
  - Security scan
  - Build verification
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Require signed commits (optional)
- ✅ Include administrators

### Develop Branch

- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Require status checks to pass
  - Linting
  - Type checking
  - Unit tests
  - Build verification
- ✅ Require branches to be up to date

## Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

<!-- Brief description of changes -->

## Related Tasks

<!-- Link to tasks from DEVELOPMENT_CHECKLIST.md -->

- [ ] CMS-001: Task description
- [ ] CMS-002: Task description

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as
      expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged and published
```

## Best Practices

### Do's

✅ Keep commits atomic and focused ✅ Write descriptive commit messages ✅ Update tests with code
changes ✅ Rebase feature branches on develop regularly ✅ Delete branches after merging ✅ Use
draft PRs for work in progress ✅ Request reviews early ✅ Keep PRs small and focused

### Don'ts

❌ Don't commit directly to main or develop ❌ Don't force push to shared branches ❌ Don't merge
without review ❌ Don't leave commented-out code ❌ Don't commit secrets or credentials ❌ Don't mix
refactoring with features ❌ Don't merge if CI fails

## Git Hooks

### Pre-commit

- Runs formatting check
- Runs linting on staged files
- Prevents commit if checks fail

### Pre-push

- Runs TypeScript type checking
- Runs unit tests
- Prevents push if checks fail

### Commit-msg

- Validates commit message format
- Ensures conventional commit format
- Prevents commit with invalid message

## Conflict Resolution

When conflicts occur:

1. **Pull latest changes from target branch**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-branch
   git rebase develop
   ```

2. **Resolve conflicts manually**
   - Open conflicted files
   - Choose correct changes
   - Remove conflict markers
   - Test the code

3. **Continue rebase**

   ```bash
   git add .
   git rebase --continue
   ```

4. **Force push (if already pushed)**
   ```bash
   git push --force-with-lease
   ```

## Semantic Versioning

We follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

Examples:

- `1.0.0` → `1.0.1` (bug fix)
- `1.0.1` → `1.1.0` (new feature)
- `1.1.0` → `2.0.0` (breaking change)

## Questions?

If you have questions about the workflow, please:

1. Check this document
2. Review closed PRs for examples
3. Ask in team chat
4. Create a discussion in GitHub

---

**Last Updated**: January 23, 2026
