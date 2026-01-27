import { Entity, Column, Index } from 'typeorm';
import { Content, ContentType } from './content.entity';

export enum DefinitionType {
  CONCEPT = 'concept',
  TERM = 'term',
  ACRONYM = 'acronym',
  API = 'api',
  PATTERN = 'pattern',
  PRINCIPLE = 'principle',
}

/**
 * Definition/Glossary Content Type
 *
 * Concise explanations of terms, concepts, and acronyms.
 * Supports cross-referencing, examples, and multiple contexts.
 */
@Entity('definitions')
@Index(['term'])
@Index(['definitionType'])
@Index(['domain'])
export class Definition extends Content {
  constructor() {
    super();
    this.contentType = ContentType.DEFINITION;
  }

  // Core definition
  @Column({ type: 'varchar', length: 255, unique: true })
  term: string;

  @Column({ type: 'text' })
  definition: string; // Concise explanation (1-3 sentences)

  @Column({
    type: 'enum',
    enum: DefinitionType,
    name: 'definition_type',
    default: DefinitionType.TERM,
  })
  definitionType: DefinitionType;

  @Column({ type: 'text', nullable: true, name: 'expanded_explanation' })
  expandedExplanation: string; // Detailed explanation

  // Context
  @Column({ type: 'varchar', length: 100, nullable: true })
  domain: string; // e.g., 'Programming', 'Web Development', 'Database'

  @Column({ type: 'simple-array', nullable: true })
  contexts: string[]; // Different contexts where term is used

  // Acronym-specific
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'full_form' })
  fullForm: string; // For acronyms: API → Application Programming Interface

  @Column({ type: 'simple-array', nullable: true })
  abbreviations: string[]; // Alternative abbreviations

  // Examples
  @Column({ type: 'jsonb', nullable: true })
  examples: {
    context: string;
    example: string;
    explanation?: string;
  }[];

  @Column({ type: 'jsonb', nullable: true, name: 'code_examples' })
  codeExamples: {
    language: string;
    code: string;
    description: string;
  }[];

  // Cross-references
  @Column({ type: 'simple-array', nullable: true })
  synonyms: string[];

  @Column({ type: 'simple-array', nullable: true })
  antonyms: string[];

  @Column({ type: 'simple-array', nullable: true, name: 'related_terms' })
  relatedTerms: string[]; // Links to other definitions

  @Column({ type: 'simple-array', nullable: true, name: 'parent_concepts' })
  parentConcepts: string[]; // Broader concepts

  @Column({ type: 'simple-array', nullable: true, name: 'child_concepts' })
  childConcepts: string[]; // More specific concepts

  // Historical context
  @Column({ type: 'text', nullable: true })
  etymology: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'first_used' })
  firstUsed: string; // Year or context when term was first used

  // Usage notes
  @Column({ type: 'text', nullable: true, name: 'common_misconceptions' })
  commonMisconceptions: string;

  @Column({ type: 'text', nullable: true, name: 'usage_notes' })
  usageNotes: string;

  @Column({ type: 'simple-array', nullable: true, name: 'industry_variants' })
  industryVariants: string[]; // How different industries use the term

  // Visual aids
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'diagram_url' })
  diagramUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'illustration_url' })
  illustrationUrl: string;

  // Pronunciation
  @Column({ type: 'varchar', length: 255, nullable: true })
  pronunciation: string; // IPA or phonetic spelling

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'audio_url' })
  audioUrl: string;
}
