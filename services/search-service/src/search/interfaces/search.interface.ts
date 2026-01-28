export interface SearchDocument {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: 'article' | 'guide' | 'tutorial' | 'reference';
  tags: string[];
  category?: string;
  author: string;
  authorName?: string;
  status: 'draft' | 'published' | 'archived';
  language: string;
  viewCount: number;
  likeCount: number;
  publishedAt: number; // Unix timestamp
  createdAt: number;
  updatedAt: number;
}

export interface SearchQuery {
  q: string;
  type?: string;
  tags?: string[];
  category?: string;
  status?: string;
  language?: string;
  limit?: number;
  offset?: number;
  sort?: string;
}

export interface SearchResult {
  hits: SearchDocument[];
  query: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
  facetDistribution?: Record<string, Record<string, number>>;
}

export interface IndexStats {
  numberOfDocuments: number;
  isIndexing: boolean;
  fieldDistribution: Record<string, number>;
}
