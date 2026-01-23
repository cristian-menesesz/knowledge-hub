# GitHub Copilot Instructions - Knowledge Hub Platform

## Project Overview

This is a **microservices-based knowledge management platform** with microfrontend architecture,
featuring content management, real-time discussions, interactive code playgrounds, and comprehensive
analytics.

## Core Technologies & Architecture

### Microservices Stack

- **Content Service**: Node.js/NestJS + Rust (content transformation)
- **User/Auth Service**: Node.js/NestJS (OAuth, JWT)
- **Comment/Discussion Service**: Node.js/NestJS + Rust WebSocket server
- **Media/Asset Service**: Go (image optimization, CDN sync)
- **Search Service**: Meilisearch
- **Analytics Service**: Rust + ClickHouse
- **API Gateway**: Kong

### Microfrontends

- **Shell/Host**: React + Webpack 5/Rspack (Module Federation)
- **Content Reader**: React
- **Content Editor**: React (block-based)
- **Admin Dashboard**: React/Vue
- **Search & Discovery**: React
- **Discussion**: React/Svelte
- **Playground**: React

### Data Layer

- **PostgreSQL**: Primary structured data (content metadata, users, comments)
- **MongoDB**: Flexible documents (drafts, asset metadata)
- **Redis**: Caching, sessions, rate limiting
- **Elasticsearch**: Full-text search
- **InfluxDB/TimescaleDB**: Time-series metrics

---

## Code Generation Guidelines

### 1. TypeScript & JavaScript Best Practices

**Always:**

- Use TypeScript with `strict: true` mode
- Define explicit types for function parameters and return values
- Use `interface` for object shapes, `type` for unions/intersections
- Implement proper error handling with custom error classes
- Use async/await over raw promises
- Apply functional programming patterns (immutability, pure functions)
- Document complex logic with TSDoc/JSDoc comments

```typescript
// Good example structure for service methods
/**
 * Retrieves content by ID with caching support
 * @param id - Content unique identifier
 * @returns Promise resolving to content or null if not found
 * @throws {ContentNotFoundError} When content doesn't exist
 */
async getContentById(id: string): Promise<Content | null> {
  const cacheKey = `content:${id}`;
  const cached = await this.cache.get<Content>(cacheKey);

  if (cached) return cached;

  const content = await this.repository.findOne({ id });
  if (!content) throw new ContentNotFoundError(id);

  await this.cache.set(cacheKey, content, { ttl: 3600 });
  return content;
}
```

### 2. React & Frontend Development

**Component Structure:**

- Use functional components with hooks
- Implement proper loading, error, and empty states
- Apply accessibility attributes (ARIA labels, roles, semantic HTML)
- Support keyboard navigation
- Implement responsive design
- Support dark mode via design tokens

```typescript
// Component template
interface ContentCardProps {
  content: Content;
  onSelect?: (id: string) => void;
  variant?: 'compact' | 'detailed';
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onSelect,
  variant = 'compact'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Always include keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(content.id);
    }
  };

  return (
    <article
      className="content-card"
      tabIndex={0}
      role="button"
      aria-label={`View ${content.title}`}
      onClick={() => onSelect?.(content.id)}
      onKeyDown={handleKeyDown}
    >
      {/* Component content */}
    </article>
  );
};
```

**State Management:**

- Use Redux Toolkit for global app state (auth, theme, feature flags)
- Use React Query/TanStack Query for server state
- Use Context for scoped state (design tokens, i18n)
- Use local useState for UI-only state

```typescript
// Redux Toolkit slice example
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchContent = createAsyncThunk(
  'content/fetch',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await contentApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// React Query example for server state
const useContent = (id: string) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### 3. NestJS Microservices

**Service Structure:**

- Use dependency injection
- Implement DTOs with class-validator
- Use guards for authentication/authorization
- Implement interceptors for logging, transformation
- Use pipes for validation
- Apply proper error handling with exception filters

```typescript
// NestJS controller example
@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly cacheService: CacheService
  ) {}

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiResponse({ status: 200, type: ContentDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ContentDto> {
    const content = await this.contentService.findOne(id);
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return plainToClass(ContentDto, content);
  }

  @Post()
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBody({ type: CreateContentDto })
  async create(@Body() createDto: CreateContentDto): Promise<ContentDto> {
    return await this.contentService.create(createDto);
  }
}

// DTO example
export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsEnum(ContentType)
  type: ContentType;
}
```

### 4. API Design

**REST APIs:**

- Follow RESTful conventions (GET, POST, PUT, PATCH, DELETE)
- Use proper HTTP status codes
- Implement pagination (cursor-based for large datasets)
- Version APIs (`/api/v1/content`)
- Include OpenAPI/Swagger documentation
- Implement rate limiting

```typescript
// Pagination example
interface PaginationQuery {
  cursor?: string;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

@Get()
async findAll(
  @Query() query: PaginationQuery
): Promise<PaginatedResponse<ContentDto>> {
  const limit = Math.min(query.limit || 20, 100);
  return await this.contentService.paginate({
    cursor: query.cursor,
    limit,
  });
}
```

**GraphQL APIs:**

- Use schema-first approach
- Implement DataLoader for N+1 problem prevention
- Use proper resolvers with field-level authorization
- Implement subscriptions for real-time features
- Add complexity analysis to prevent expensive queries

```typescript
// GraphQL resolver example
@Resolver(() => Content)
export class ContentResolver {
  constructor(
    private contentService: ContentService,
    @Inject(CONTENT_LOADER) private contentLoader: DataLoader<string, Content>
  ) {}

  @Query(() => Content, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async content(@Args('id') id: string): Promise<Content | null> {
    return await this.contentLoader.load(id);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() content: Content): Promise<Comment[]> {
    return await this.contentService.getComments(content.id);
  }

  @Subscription(() => Comment)
  @UseGuards(GqlAuthGuard)
  commentAdded(@Args('contentId') contentId: string) {
    return this.pubSub.asyncIterator(`comment.created.${contentId}`);
  }
}
```

**gRPC (Internal Services):**

- Define services in .proto files
- Use for high-performance internal communication
- Implement proper error handling with status codes

### 5. Database Operations

**PostgreSQL:**

- Use TypeORM or Prisma for ORM
- Always use parameterized queries (prevent SQL injection)
- Implement proper indexing strategies
- Use migrations for schema changes
- Implement database transactions for multi-step operations

```typescript
// TypeORM repository pattern
@Injectable()
export class ContentRepository {
  constructor(
    @InjectRepository(ContentEntity)
    private repository: Repository<ContentEntity>,
    private dataSource: DataSource
  ) {}

  async createWithVersion(contentData: CreateContentDto): Promise<ContentEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const content = queryRunner.manager.create(ContentEntity, contentData);
      const savedContent = await queryRunner.manager.save(content);

      const version = queryRunner.manager.create(ContentVersionEntity, {
        contentId: savedContent.id,
        snapshot: savedContent,
      });
      await queryRunner.manager.save(version);

      await queryRunner.commitTransaction();
      return savedContent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

**Redis Caching:**

- Use cache-aside pattern
- Set appropriate TTLs
- Implement cache invalidation strategies
- Use Redis for rate limiting and sessions

```typescript
// Cache service pattern
@Injectable()
export class CacheService {
  constructor(@InjectRedis() private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set<T>(key: string, value: T, options: { ttl?: number } = {}): Promise<void> {
    const serialized = JSON.stringify(value);
    if (options.ttl) {
      await this.redis.setex(key, options.ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 6. Event-Driven Architecture

**Kafka Integration:**

- Use clear event naming convention: `domain.action` (e.g., `content.published`)
- Include correlation IDs for tracing
- Implement idempotent consumers
- Use schemas for event validation (JSON Schema or Avro)

```typescript
// Event producer
interface ContentPublishedEvent {
  eventId: string;
  eventType: 'content.published';
  timestamp: string;
  correlationId: string;
  data: {
    contentId: string;
    title: string;
    authorId: string;
    publishedAt: string;
  };
}

@Injectable()
export class ContentEventProducer {
  constructor(@Inject('KAFKA_PRODUCER') private producer: Producer) {}

  async publishContentPublished(content: Content): Promise<void> {
    const event: ContentPublishedEvent = {
      eventId: uuidv4(),
      eventType: 'content.published',
      timestamp: new Date().toISOString(),
      correlationId: AsyncLocalStorage.getStore()?.correlationId || uuidv4(),
      data: {
        contentId: content.id,
        title: content.title,
        authorId: content.authorId,
        publishedAt: content.publishedAt.toISOString(),
      },
    };

    await this.producer.send({
      topic: 'content-events',
      messages: [{ key: content.id, value: JSON.stringify(event) }],
    });
  }
}

// Event consumer
@Injectable()
export class ContentEventConsumer {
  @OnEvent('content.published')
  async handleContentPublished(event: ContentPublishedEvent): Promise<void> {
    const { contentId } = event.data;

    // Idempotency check
    const processed = await this.processedEvents.exists(event.eventId);
    if (processed) return;

    try {
      // Reindex in search
      await this.searchService.indexContent(contentId);

      // Invalidate cache
      await this.cacheService.invalidatePattern(`content:${contentId}*`);

      // Mark as processed
      await this.processedEvents.set(event.eventId, true, { ttl: 86400 });
    } catch (error) {
      this.logger.error(`Failed to process event ${event.eventId}`, error);
      throw error; // Trigger retry
    }
  }
}
```

**WebSocket Real-Time Features:**

- Use Socket.io or native WebSocket
- Implement reconnection logic
- Use rooms for targeted broadcasting
- Include authentication for WebSocket connections

```typescript
// WebSocket gateway (NestJS)
@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  namespace: 'discussions',
})
export class DiscussionGateway {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  @SubscribeMessage('join:content')
  handleJoinContent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { contentId: string }
  ): void {
    client.join(`content:${data.contentId}`);
  }

  async broadcastNewComment(comment: Comment): Promise<void> {
    this.server.to(`content:${comment.contentId}`).emit('comment:created', {
      comment: this.serializeComment(comment),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('comment:create')
  async handleCreateComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateCommentDto
  ): Promise<void> {
    const comment = await this.commentService.create(data);
    await this.broadcastNewComment(comment);
  }
}
```

### 7. Design System & UI Components

**Component Guidelines:**

- Use shadcn/ui + Radix UI primitives as base
- Apply design tokens for theming
- Support variants and sizes
- Include proper TypeScript props
- Document in Storybook

```typescript
// Button component example with design tokens
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

// Storybook story
export default {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Versatile button component with multiple variants and sizes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
  },
} as Meta<typeof Button>;
```

### 8. Testing Standards

**Unit Tests (Jest + React Testing Library):**

- Test behavior, not implementation
- Use descriptive test names
- Mock external dependencies
- Aim for 80%+ coverage on critical paths

```typescript
// Component test example
describe('ContentCard', () => {
  it('should render content title and description', () => {
    const content = createMockContent({ title: 'Test Article' });
    render(<ContentCard content={content} />);

    expect(screen.getByText('Test Article')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const handleSelect = jest.fn();
    const content = createMockContent({ id: '123' });

    render(<ContentCard content={content} onSelect={handleSelect} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleSelect).toHaveBeenCalledWith('123');
  });

  it('should handle keyboard navigation', async () => {
    const handleSelect = jest.fn();
    const content = createMockContent({ id: '123' });

    render(<ContentCard content={content} onSelect={handleSelect} />);

    const card = screen.getByRole('button');
    card.focus();
    await userEvent.keyboard('{Enter}');

    expect(handleSelect).toHaveBeenCalledWith('123');
  });
});

// Service test example
describe('ContentService', () => {
  let service: ContentService;
  let repository: jest.Mocked<ContentRepository>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    repository = createMockRepository();
    cacheService = createMockCacheService();
    service = new ContentService(repository, cacheService);
  });

  it('should return cached content if available', async () => {
    const cachedContent = createMockContent();
    cacheService.get.mockResolvedValue(cachedContent);

    const result = await service.getContentById('123');

    expect(result).toEqual(cachedContent);
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  it('should cache content after fetching from database', async () => {
    const content = createMockContent();
    cacheService.get.mockResolvedValue(null);
    repository.findOne.mockResolvedValue(content);

    await service.getContentById('123');

    expect(cacheService.set).toHaveBeenCalledWith(
      'content:123',
      content,
      { ttl: 3600 }
    );
  });
});
```

**E2E Tests (Playwright):**

- Test critical user journeys
- Use Page Object Model pattern
- Include accessibility checks
- Run against multiple browsers

```typescript
// Page Object Model
export class ContentPage {
  constructor(private page: Page) {}

  async goto(id: string) {
    await this.page.goto(`/content/${id}`);
  }

  async getTitle() {
    return await this.page.locator('h1').textContent();
  }

  async addComment(text: string) {
    await this.page.fill('[data-testid="comment-input"]', text);
    await this.page.click('[data-testid="submit-comment"]');
  }

  async waitForCommentToAppear(text: string) {
    await this.page.waitForSelector(`text=${text}`);
  }
}

// E2E test
test.describe('Content Reading Flow', () => {
  let contentPage: ContentPage;

  test.beforeEach(async ({ page }) => {
    contentPage = new ContentPage(page);
  });

  test('should display content and allow commenting', async ({ page }) => {
    await contentPage.goto('test-article-123');

    // Check content loads
    expect(await contentPage.getTitle()).toBe('Test Article');

    // Add comment
    await contentPage.addComment('Great article!');
    await contentPage.waitForCommentToAppear('Great article!');

    // Verify comment appears
    expect(await page.textContent('[data-testid="comments"]')).toContain('Great article!');
  });

  test('should meet accessibility standards', async ({ page }) => {
    await contentPage.goto('test-article-123');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### 9. DevOps & Infrastructure

**Docker:**

- Use multi-stage builds
- Minimize image size (Alpine base)
- Use .dockerignore
- Don't run as root

```dockerfile
# Multi-stage build example
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Security: Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
```

**Kubernetes:**

- Define resource limits and requests
- Use health checks (liveness, readiness)
- Apply proper labels and annotations
- Use ConfigMaps for configuration
- Use Secrets for sensitive data

```yaml
# Kubernetes deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: content-service
  labels:
    app: content-service
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: content-service
  template:
    metadata:
      labels:
        app: content-service
        version: v1
    spec:
      containers:
        - name: content-service
          image: registry.example.com/content-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: content-service-secrets
                  key: database-url
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

**Terraform (IaC):**

- Use modules for reusability
- Keep state remote (S3 + DynamoDB)
- Use variables for environment-specific values
- Apply proper tagging

```hcl
# Terraform module example
module "vpc" {
  source = "./modules/vpc"

  environment = var.environment
  vpc_cidr    = var.vpc_cidr

  tags = {
    Project     = "knowledge-hub"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

module "eks_cluster" {
  source = "./modules/eks"

  cluster_name    = "knowledge-hub-${var.environment}"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  cluster_version = "1.28"

  node_groups = {
    general = {
      desired_size = 3
      min_size     = 2
      max_size     = 5
      instance_types = ["t3.medium"]
    }
  }
}

# Backend configuration
terraform {
  backend "s3" {
    bucket         = "knowledge-hub-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
```

### 10. Observability

**Structured Logging:**

- Use JSON format
- Include correlation IDs
- Log at appropriate levels
- Include context (user ID, request ID)

```typescript
// Logger service
@Injectable()
export class LoggerService {
  private logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

  log(message: string, context?: Record<string, any>) {
    this.logger.info(message, {
      timestamp: new Date().toISOString(),
      correlationId: this.getCorrelationId(),
      ...context,
    });
  }

  error(message: string, error: Error, context?: Record<string, any>) {
    this.logger.error(message, {
      timestamp: new Date().toISOString(),
      correlationId: this.getCorrelationId(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...context,
    });
  }

  private getCorrelationId(): string {
    return AsyncLocalStorage.getStore()?.correlationId || 'unknown';
  }
}
```

**Metrics (Prometheus):**

- Expose /metrics endpoint
- Track business and technical metrics
- Use appropriate metric types (counter, gauge, histogram)

```typescript
// Metrics example
@Injectable()
export class MetricsService {
  private readonly httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
  });

  private readonly contentViews = new promClient.Counter({
    name: 'content_views_total',
    help: 'Total number of content views',
    labelNames: ['content_id', 'content_type'],
  });

  recordRequestDuration(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration.labels(method, route, statusCode.toString()).observe(duration);
  }

  incrementContentView(contentId: string, contentType: string) {
    this.contentViews.labels(contentId, contentType).inc();
  }
}
```

### 11. Security Best Practices

**Authentication & Authorization:**

- Use JWT with short expiry + refresh tokens
- Implement OAuth2 for third-party auth
- Apply RBAC (Role-Based Access Control)
- Use guards/middleware for route protection

```typescript
// JWT strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}

// Admin guard
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user?.roles?.includes('admin') ?? false;
  }
}
```

**Input Validation:**

- Validate all user inputs
- Use class-validator for DTOs
- Sanitize inputs to prevent XSS
- Use parameterized queries for SQL

**Security Headers:**

- Implement helmet.js
- Set CSP (Content Security Policy)
- Enable CORS with whitelist
- Use HTTPS only

```typescript
// Security configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
});
```

### 12. Performance Optimization

**Frontend:**

- Implement code splitting
- Use lazy loading for routes and components
- Apply memoization (React.memo, useMemo, useCallback)
- Optimize images (WebP, lazy loading)
- Use CDN for static assets

```typescript
// Code splitting example
const ContentEditor = React.lazy(() => import('./components/ContentEditor'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/editor" element={<ContentEditor />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}

// Memoization example
const ContentList = React.memo(({ contents, onSelect }: ContentListProps) => {
  const sortedContents = useMemo(
    () => contents.sort((a, b) => b.publishedAt - a.publishedAt),
    [contents]
  );

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <div>
      {sortedContents.map(content => (
        <ContentCard key={content.id} content={content} onSelect={handleSelect} />
      ))}
    </div>
  );
});
```

**Backend:**

- Implement caching strategies
- Use database indexing
- Apply pagination for large datasets
- Use connection pooling
- Implement rate limiting

```typescript
// Rate limiting
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
export class AppModule {}

@Controller('content')
@UseGuards(ThrottlerGuard)
export class ContentController {
  // Routes are automatically rate-limited
}
```

### 13. Module Federation (Microfrontends)

**Shell Configuration:**

```typescript
// webpack.config.js for shell
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        contentReader: 'contentReader@http://localhost:3001/remoteEntry.js',
        contentEditor: 'contentEditor@http://localhost:3002/remoteEntry.js',
        adminDashboard: 'adminDashboard@http://localhost:3003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'react-router-dom': { singleton: true },
      },
    }),
  ],
};

// Remote loading
const ContentReader = React.lazy(() => import('contentReader/App'));
```

### 14. Git & Version Control

**Commit Messages:**

- Use Conventional Commits format
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore

```bash
# Good examples
feat(content-service): add full-text search capability
fix(auth): resolve token refresh race condition
docs(readme): update deployment instructions
test(comments): add E2E tests for threading
refactor(cache): extract Redis logic to separate service
```

**Branch Strategy:**

- `main` - production-ready code
- `develop` - integration branch
- `feature/*` - feature branches
- `hotfix/*` - urgent fixes

---

## Key Principles to Follow

1. **Type Safety First**: Always use TypeScript with strict mode
2. **API-First Design**: Define contracts before implementation
3. **Test-Driven Development**: Write tests alongside code
4. **Security by Default**: Validate inputs, sanitize outputs, use parameterized queries
5. **Performance-Conscious**: Cache aggressively, paginate, optimize queries
6. **Accessibility**: WCAG 2.1 AA compliance minimum
7. **Observability**: Log structured data, emit metrics, trace requests
8. **Error Handling**: Graceful degradation, user-friendly messages
9. **Documentation**: TSDoc for code, OpenAPI for APIs, ADRs for decisions
10. **Clean Code**: SOLID principles, DRY, KISS

## Common Patterns to Apply

### Repository Pattern

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: FilterQuery<T>): Promise<T[]>;
  create(data: CreateDto<T>): Promise<T>;
  update(id: string, data: UpdateDto<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### Service Layer Pattern

```typescript
@Injectable()
export class ContentService {
  constructor(
    private repository: ContentRepository,
    private cacheService: CacheService,
    private eventBus: EventBus
  ) {}

  // Business logic here
}
```

### Factory Pattern for DTOs

```typescript
export class ContentFactory {
  static toDto(entity: ContentEntity): ContentDto {
    return {
      id: entity.id,
      title: entity.title,
      // ... map all fields
    };
  }

  static toEntity(dto: CreateContentDto): ContentEntity {
    const entity = new ContentEntity();
    entity.title = dto.title;
    // ... map all fields
    return entity;
  }
}
```

---

## When in Doubt

1. **Prefer composition over inheritance**
2. **Make functions pure when possible**
3. **Keep components small and focused**
4. **Extract reusable logic into hooks/utilities**
5. **Write self-documenting code with clear naming**
6. **Add comments for complex business logic only**
7. **Follow established patterns in the codebase**
