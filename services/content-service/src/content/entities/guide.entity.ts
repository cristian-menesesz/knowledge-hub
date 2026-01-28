import { Entity, Column, Index } from 'typeorm';
import { Content, ContentType } from './content.entity';

export enum GuideType {
  TUTORIAL = 'tutorial',
  HOW_TO = 'how-to',
  REFERENCE = 'reference',
  QUICK_START = 'quick-start',
  TROUBLESHOOTING = 'troubleshooting',
  BEST_PRACTICES = 'best-practices',
  MIGRATION = 'migration',
}

export enum GuideFormat {
  STEP_BY_STEP = 'step-by-step',
  CHECKLIST = 'checklist',
  DECISION_TREE = 'decision-tree',
  COMPARISON = 'comparison',
  REFERENCE_SHEET = 'reference-sheet',
}

/**
 * Reference Guide Content Type
 *
 * Comprehensive guides, tutorials, and how-to documentation.
 * Supports step-by-step instructions, checklists, and technical specifications.
 */
@Entity('guides')
@Index(['guideType'])
@Index(['guideFormat'])
@Index(['technology'])
export class Guide extends Content {
  constructor() {
    super();
    this.contentType = ContentType.GUIDE;
  }

  // Guide classification
  @Column({
    type: 'enum',
    enum: GuideType,
    name: 'guide_type',
    default: GuideType.REFERENCE,
  })
  guideType: GuideType;

  @Column({
    type: 'enum',
    enum: GuideFormat,
    name: 'guide_format',
    default: GuideFormat.STEP_BY_STEP,
  })
  guideFormat: GuideFormat;

  @Column({ type: 'varchar', length: 100, nullable: true })
  technology: string; // e.g., 'Docker', 'Kubernetes', 'PostgreSQL'

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'technology_version' })
  technologyVersion: string;

  // Content structure
  @Column({ type: 'text', nullable: true })
  overview: string;

  /**
   * Guide body - Parsed KHML document in JSONB format
   *
   * This field stores the structured KHML document for the main guide content.
   * Structure follows the KHMLDocument interface.
   *
   * @see KHML_SPECIFICATION.md for detailed structure
   * @see services/khml for parser and renderer
   */
  @Column({ type: 'jsonb', nullable: true })
  body: Record<string, unknown>; // KHML parsed to JSONB

  /**
   * Raw KHML source (optional)
   *
   * Store the original KHML source for version control and re-parsing.
   */
  @Column({ type: 'text', nullable: true, name: 'body_source' })
  bodySource: string; // Original KHML source

  @Column({ type: 'jsonb', nullable: true })
  steps: {
    order: number;
    title: string;
    description: string;
    code?: string;
    language?: string;
    expectedOutput?: string;
    troubleshooting?: string;
    timeEstimate?: number; // in minutes
  }[];

  @Column({ type: 'jsonb', nullable: true })
  sections: {
    title: string;
    content: Record<string, unknown>; // Can also be KHML JSONB
    order: number;
  }[];

  // Prerequisites and requirements
  @Column({ type: 'jsonb', nullable: true })
  prerequisites: {
    type: 'knowledge' | 'software' | 'hardware' | 'account';
    name: string;
    description: string;
    required: boolean;
    link?: string;
  }[];

  @Column({ type: 'simple-array', nullable: true, name: 'required_tools' })
  requiredTools: string[];

  @Column({ type: 'simple-array', nullable: true, name: 'system_requirements' })
  systemRequirements: string[];

  // Time and effort
  @Column({ type: 'int', nullable: true, name: 'estimated_time' })
  estimatedTime: number; // in minutes

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'skill_level' })
  skillLevel: string; // Matches ContentDifficulty or custom

  // Outcomes
  @Column({ type: 'simple-array', nullable: true, name: 'learning_outcomes' })
  learningOutcomes: string[];

  @Column({ type: 'simple-array', nullable: true, name: 'deliverables' })
  deliverables: string[]; // What you'll build/create

  // Reference information
  @Column({ type: 'jsonb', nullable: true, name: 'api_reference' })
  apiReference: {
    endpoint?: string;
    method?: string;
    parameters?: Record<string, unknown>;
    response?: Record<string, unknown>;
    examples?: Record<string, unknown>[];
  }[];

  @Column({ type: 'jsonb', nullable: true, name: 'command_reference' })
  commandReference: {
    command: string;
    description: string;
    options?: string[];
    examples?: string[];
  }[];

  @Column({ type: 'jsonb', nullable: true, name: 'configuration_options' })
  configurationOptions: {
    name: string;
    type: string;
    default?: string;
    description: string;
    required: boolean;
  }[];

  // Troubleshooting
  @Column({ type: 'jsonb', nullable: true, name: 'common_issues' })
  commonIssues: {
    issue: string;
    cause: string;
    solution: string;
    code?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  faqs: {
    question: string;
    answer: string;
  }[];

  // Version and updates
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'guide_version' })
  guideVersion: string;

  @Column({ type: 'timestamp', nullable: true, name: 'last_verified_at' })
  lastVerifiedAt: Date; // When guide was last tested/verified

  @Column({ type: 'simple-array', nullable: true, name: 'version_compatibility' })
  versionCompatibility: string[]; // Supported versions of the technology

  // Migrations and upgrades
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'migration_from' })
  migrationFrom: string; // For migration guides

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'migration_to' })
  migrationTo: string;

  @Column({ type: 'jsonb', nullable: true, name: 'breaking_changes' })
  breakingChanges: {
    change: string;
    impact: string;
    mitigation: string;
  }[];

  // Additional resources
  @Column({ type: 'jsonb', nullable: true, name: 'official_docs' })
  officialDocs: {
    title: string;
    url: string;
  }[];

  @Column({ type: 'simple-array', nullable: true, name: 'related_guides' })
  relatedGuides: string[]; // UUIDs of related guides

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'source_repository' })
  sourceRepository: string; // GitHub repo with example code
}
