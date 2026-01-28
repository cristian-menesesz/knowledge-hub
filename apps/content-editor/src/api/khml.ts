import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ line: number; column: number; message: string }>;
}

export interface RenderResult {
  html: string;
}

export interface ParseResult {
  version: string;
  blocks: unknown[];
  metadata?: Record<string, unknown>;
}

export const khmlApi = {
  /**
   * Validate KHML source code
   */
  validate: async (source: string): Promise<ValidationResult> => {
    const response = await apiClient.post<ValidationResult>('/khml/validate', {
      source,
    });
    return response.data;
  },

  /**
   * Render KHML to HTML
   */
  render: async (
    source: string,
    options?: { classPrefix?: string }
  ): Promise<RenderResult> => {
    const response = await apiClient.post<RenderResult>('/khml/render', {
      source,
      ...options,
    });
    return response.data;
  },

  /**
   * Parse KHML to JSONB
   */
  parse: async (source: string): Promise<ParseResult> => {
    const response = await apiClient.post<ParseResult>('/khml/parse', {
      source,
    });
    return response.data;
  },

  /**
   * Extract plain text from KHML
   */
  extractText: async (source: string): Promise<{ text: string }> => {
    const response = await apiClient.post<{ text: string }>(
      '/khml/extract-text',
      { source }
    );
    return response.data;
  },

  /**
   * Extract metadata from KHML
   */
  extractMetadata: async (
    source: string
  ): Promise<{
    title?: string;
    author?: string;
    tags?: string[];
    difficulty?: string;
  }> => {
    const response = await apiClient.post('/khml/extract-metadata', { source });
    return response.data;
  },
};

export default apiClient;
