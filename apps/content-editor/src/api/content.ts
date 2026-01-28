import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export enum ContentType {
  ARTICLE = 'article',
  TUTORIAL = 'tutorial',
  REFERENCE_GUIDE = 'reference-guide',
  CONCEPT_EXPLANATION = 'concept-explanation',
  CODE_SNIPPET = 'code-snippet',
  VIDEO = 'video',
}

export enum ContentDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  description: string;
  contentType: ContentType;
  authorId: string;
  tags: string[];
  concepts: string[];
  category: string;
  difficulty: ContentDifficulty;
  status: ContentStatus;
  publishedAt: string | null;
  viewCount: number;
  likeCount: number;
  estimatedReadTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentDto {
  title: string;
  slug: string;
  description?: string;
  contentType: ContentType;
  authorId: string;
  tags?: string[];
  concepts?: string[];
  category?: string;
  difficulty?: ContentDifficulty;
  khmlContent: string;
}

export interface PublishContentResponse {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  publishedAt: string;
  message: string;
}

export const contentApi = {
  /**
   * Create new published content
   */
  async create(data: CreateContentDto): Promise<Content> {
    const response = await apiClient.post<Content>('/contents', data);
    return response.data;
  },

  /**
   * Publish existing content by ID
   */
  async publish(id: string): Promise<Content> {
    const response = await apiClient.post<Content>(`/contents/${id}/publish`);
    return response.data;
  },

  /**
   * Get content by ID
   */
  async getById(id: string): Promise<Content> {
    const response = await apiClient.get<Content>(`/contents/${id}`);
    return response.data;
  },

  /**
   * Get content by slug
   */
  async getBySlug(slug: string): Promise<Content> {
    const response = await apiClient.get<Content>(`/contents/slug/${slug}`);
    return response.data;
  },

  /**
   * Update content
   */
  async update(id: string, data: Partial<CreateContentDto>): Promise<Content> {
    const response = await apiClient.patch<Content>(`/contents/${id}`, data);
    return response.data;
  },

  /**
   * Delete content
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/contents/${id}`);
  },
};
