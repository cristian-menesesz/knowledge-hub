import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

/**
 * Draft Block Types
 * Flexible structure for block-based editor
 */
export interface IBlock {
  id: string;
  type:
    | 'paragraph'
    | 'heading'
    | 'code'
    | 'image'
    | 'list'
    | 'quote'
    | 'embed'
    | 'divider';
  content?: string;
  properties?: {
    level?: number; // For headings (1-6)
    language?: string; // For code blocks
    url?: string; // For images/embeds
    alt?: string; // For images
    items?: string[]; // For lists
    ordered?: boolean; // For lists
    [key: string]: unknown;
  };
}

/**
 * Draft Document Interface
 * Stored in MongoDB for flexible, fast auto-save
 */
export interface IDraft extends Document {
  authorId: string;
  contentId?: string; // If linked to a published content
  title: string;
  type:
    | 'article'
    | 'experiment'
    | 'code_snippet'
    | 'deep_dive'
    | 'definition'
    | 'architecture_diagram'
    | 'project_log'
    | 'reference_guide'
    | 'tutorial';

  // Block-based content
  blocks: IBlock[];

  // Metadata (work in progress)
  tags: string[];
  concepts: string[];
  excerpt?: string;

  // Auto-save tracking
  lastSavedAt: Date;
  autoSave: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Draft Schema
 */
const BlockSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'paragraph',
        'heading',
        'code',
        'image',
        'list',
        'quote',
        'embed',
        'divider',
      ],
    },
    content: String,
    properties: Schema.Types.Mixed,
  },
  { _id: false }
);

const DraftSchema = new Schema<IDraft>(
  {
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Untitled Draft',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'article',
        'experiment',
        'code_snippet',
        'deep_dive',
        'definition',
        'architecture_diagram',
        'project_log',
        'reference_guide',
        'tutorial',
      ],
      default: 'article',
    },
    blocks: {
      type: [BlockSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    concepts: {
      type: [String],
      default: [],
    },
    excerpt: String,
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
    autoSave: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'drafts',
  }
);

// Indexes for efficient queries
DraftSchema.index({ authorId: 1, updatedAt: -1 });
DraftSchema.index({ contentId: 1 });

// Methods
DraftSchema.methods.updateSaveTime = function () {
  this.lastSavedAt = new Date();
  return this.save();
};

export const Draft = mongoose.model<IDraft>('Draft', DraftSchema);
