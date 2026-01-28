import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Draft {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  contentType: 'article' | 'tutorial' | 'reference-guide';
  status: 'draft' | 'review' | 'published';
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
}

export interface CreateDraftDto {
  title: string;
  content: string;
  authorId: string;
  contentType?: 'article' | 'tutorial' | 'reference-guide';
  tags?: string[];
  category?: string;
}

export interface AutoSaveResponse {
  id: string;
  lastSavedAt: string;
  content: string;
}

export const draftApi = {
  /**
   * Create a new draft
   */
  async create(data: CreateDraftDto): Promise<Draft> {
    const response = await apiClient.post<Draft>('/drafts', data);
    return response.data;
  },

  /**
   * Auto-save draft content (lightweight update)
   */
  async autoSave(id: string, content: string): Promise<AutoSaveResponse> {
    const response = await apiClient.post<AutoSaveResponse>(
      `/drafts/${id}/auto-save`,
      { content }
    );
    return response.data;
  },

  /**
   * Get draft by ID
   */
  async getById(id: string): Promise<Draft> {
    const response = await apiClient.get<Draft>(`/drafts/${id}`);
    return response.data;
  },

  /**
   * Update draft
   */
  async update(id: string, data: Partial<CreateDraftDto>): Promise<Draft> {
    const response = await apiClient.patch<Draft>(`/drafts/${id}`, data);
    return response.data;
  },

  /**
   * Delete draft
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/drafts/${id}`);
  },

  /**
   * Get recent drafts
   */
  async getRecent(limit: number = 10): Promise<Draft[]> {
    const response = await apiClient.get<Draft[]>('/drafts/recent', {
      params: { limit },
    });
    return response.data;
  },
};
