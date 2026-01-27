import { Entity, Column, Index } from 'typeorm';
import { Content, ContentType } from './content.entity';

/**
 * Article Content Type
 *
 * Long-form educational content with structured sections.
 * Supports reading time estimation, table of contents, and rich metadata.
 */
@Entity('articles')
@Index(['readingTime'])
@Index(['wordCount'])
export class Article extends Content {
  constructor() {
    super();
    this.contentType = ContentType.ARTICLE;
  }

  // Article-specific content
  @Column({ type: 'text', nullable: true })
  introduction: string;

  @Column({ type: 'jsonb', nullable: true })
  body: Record<string, unknown>; // Block-based content structure (from editor)

  @Column({ type: 'text', nullable: true })
  conclusion: string;

  @Column({ type: 'jsonb', nullable: true, name: 'table_of_contents' })
  tableOfContents: {
    level: number;
    title: string;
    anchor: string;
  }[];

  // Article metadata
  @Column({ type: 'int', nullable: true, name: 'reading_time' })
  readingTime: number; // in minutes

  @Column({ type: 'int', nullable: true, name: 'word_count' })
  wordCount: number;

  @Column({ type: 'simple-array', nullable: true, name: 'key_takeaways' })
  keyTakeaways: string[];

  @Column({ type: 'simple-array', nullable: true })
  prerequisites: string[]; // e.g., ['javascript-basics', 'html-fundamentals']

  @Column({ type: 'simple-array', nullable: true, name: 'related_content_ids' })
  relatedContentIds: string[]; // UUIDs of related content

  // Learning path
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'learning_path' })
  learningPath: string; // e.g., 'Web Development Fundamentals'

  @Column({ type: 'int', nullable: true, name: 'sequence_number' })
  sequenceNumber: number; // Position in learning path

  // Series information
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'series_name' })
  seriesName: string;

  @Column({ type: 'int', nullable: true, name: 'series_part' })
  seriesPart: number;

  @Column({ type: 'int', nullable: true, name: 'series_total' })
  seriesTotal: number;

  // External resources
  @Column({ type: 'jsonb', nullable: true, name: 'external_resources' })
  externalResources: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'video' | 'tool' | 'other';
  }[];
}
