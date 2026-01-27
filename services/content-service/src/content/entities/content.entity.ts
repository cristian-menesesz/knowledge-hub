import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum ContentType {
  ARTICLE = 'article',
  CODE_SNIPPET = 'code-snippet',
  DEFINITION = 'definition',
  GUIDE = 'guide',
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ContentDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('contents')
@Index(['status'])
@Index(['contentType'])
@Index(['authorId'])
@Index(['publishedAt'])
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    name: 'content_type',
  })
  contentType: ContentType;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;

  @Column({ type: 'uuid', name: 'author_id' })
  authorId: string;

  // Metadata
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  concepts: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({
    type: 'enum',
    enum: ContentDifficulty,
    nullable: true,
  })
  difficulty: ContentDifficulty;

  // SEO
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'seo_title' })
  seoTitle: string;

  @Column({ type: 'text', nullable: true, name: 'seo_description' })
  seoDescription: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'canonical_url' })
  canonicalUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'featured_image_url' })
  featuredImageUrl: string;

  // Stats
  @Column({ type: 'int', default: 0, name: 'views_count' })
  viewsCount: number;

  @Column({ type: 'int', default: 0, name: 'likes_count' })
  likesCount: number;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'published_at' })
  publishedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
