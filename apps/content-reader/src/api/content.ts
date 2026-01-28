import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ContentMetadata {
  id: string;
  title: string;
  description?: string;
  slug: string;
  authorId: string;
  contentType: 'article' | 'tutorial' | 'reference-guide';
  status: 'draft' | 'review' | 'published';
  tags: string[];
  category: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  readingTime?: number;
}

export interface ContentDetail extends ContentMetadata {
  content: string;
  html: string;
  tableOfContents?: TableOfContentsItem[];
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const contentApi = {
  /**
   * Get content by ID
   */
  async getById(id: string): Promise<ContentDetail> {
    const response = await apiClient.get<ContentDetail>(`/contents/${id}`);
    return response.data;
  },

  /**
   * Get content by slug
   */
  async getBySlug(slug: string): Promise<ContentDetail> {
    const response = await apiClient.get<ContentDetail>(
      `/contents/slug/${slug}`
    );
    return response.data;
  },

  /**
   * List published content with pagination
   */
  async list(params?: {
    page?: number;
    limit?: number;
    category?: string;
    tags?: string[];
    search?: string;
  }): Promise<PaginatedResponse<ContentMetadata>> {
    const response = await apiClient.get<PaginatedResponse<ContentMetadata>>(
      '/contents',
      {
        params: {
          status: 'published',
          ...params,
        },
      }
    );
    return response.data;
  },

  /**
   * Get related content
   */
  async getRelated(id: string, limit: number = 5): Promise<ContentMetadata[]> {
    const response = await apiClient.get<ContentMetadata[]>(
      `/contents/${id}/related`,
      {
        params: { limit },
      }
    );
    return response.data;
  },
};
