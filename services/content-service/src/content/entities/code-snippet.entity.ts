import { Entity, Column, Index } from 'typeorm';
import { Content, ContentType } from './content.entity';

export enum ProgrammingLanguage {
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  JAVA = 'java',
  GO = 'go',
  RUST = 'rust',
  CPP = 'cpp',
  CSHARP = 'csharp',
  PHP = 'php',
  RUBY = 'ruby',
  SWIFT = 'swift',
  KOTLIN = 'kotlin',
  SQL = 'sql',
  HTML = 'html',
  CSS = 'css',
  SHELL = 'shell',
  YAML = 'yaml',
  JSON = 'json',
  OTHER = 'other',
}

/**
 * Code Snippet Content Type
 *
 * Reusable code examples with syntax highlighting, execution context,
 * and detailed explanations.
 */
@Entity('code_snippets')
@Index(['language'])
@Index(['framework'])
@Index(['useCase'])
export class CodeSnippet extends Content {
  constructor() {
    super();
    this.contentType = ContentType.CODE_SNIPPET;
  }

  // Code content
  @Column({ type: 'text' })
  code: string;

  @Column({
    type: 'enum',
    enum: ProgrammingLanguage,
    default: ProgrammingLanguage.JAVASCRIPT,
  })
  language: ProgrammingLanguage;

  @Column({ type: 'varchar', length: 100, nullable: true })
  framework: string; // e.g., 'React', 'NestJS', 'Django'

  @Column({ type: 'varchar', length: 100, nullable: true })
  version: string; // e.g., '18.2.0', '3.9'

  // Context
  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'text', nullable: true, name: 'use_case' })
  useCase: string; // When and why to use this snippet

  @Column({ type: 'simple-array', nullable: true, name: 'use_cases' })
  useCases: string[]; // Multiple use cases

  // Execution details
  @Column({ type: 'text', nullable: true, name: 'output_example' })
  outputExample: string;

  @Column({ type: 'simple-array', nullable: true })
  dependencies: string[]; // e.g., ['lodash@4.17.21', 'axios@1.6.0']

  @Column({ type: 'text', nullable: true, name: 'setup_instructions' })
  setupInstructions: string;

  @Column({ type: 'boolean', default: false, name: 'is_executable' })
  isExecutable: boolean; // Can be run in playground

  // Code quality
  @Column({ type: 'int', nullable: true, name: 'lines_of_code' })
  linesOfCode: number;

  @Column({ type: 'simple-array', nullable: true, name: 'best_practices' })
  bestPractices: string[];

  @Column({ type: 'simple-array', nullable: true, name: 'common_pitfalls' })
  commonPitfalls: string[];

  // Alternatives and variations
  @Column({ type: 'jsonb', nullable: true })
  variations: {
    title: string;
    code: string;
    description: string;
  }[];

  @Column({ type: 'simple-array', nullable: true, name: 'alternative_approaches' })
  alternativeApproaches: string[]; // Links to other snippets

  // Performance
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'time_complexity' })
  timeComplexity: string; // e.g., 'O(n)', 'O(log n)'

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'space_complexity' })
  spaceComplexity: string;

  // Integration
  @Column({ type: 'simple-array', nullable: true, name: 'related_snippets' })
  relatedSnippets: string[]; // UUIDs of related snippets
}
