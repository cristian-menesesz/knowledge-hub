import { Injectable, Logger } from '@nestjs/common';
import { KHMLDocument } from '../types/khml.types';

/**
 * KHML Cache Service
 *
 * Provides caching layer for KHML rendering operations to improve performance.
 * Caches both parsed JSONB documents and rendered HTML output.
 *
 * Uses in-memory caching with LRU eviction policy.
 * For production, consider integrating with Redis.
 */
@Injectable()
export class KHMLCacheService {
  private readonly logger = new Logger(KHMLCacheService.name);

  // In-memory cache maps
  private readonly parseCache = new Map<string, KHMLDocument>();
  private readonly renderCache = new Map<string, string>();

  // Cache configuration
  private readonly maxCacheSize = 1000;
  private readonly cacheTTL = 3600000; // 1 hour in milliseconds

  // Cache statistics
  private parseHits = 0;
  private parseMisses = 0;
  private renderHits = 0;
  private renderMisses = 0;

  /**
   * Get cached parsed KHML document
   */
  getCachedParse(source: string): KHMLDocument | null {
    const cacheKey = this.generateCacheKey(source);
    const cached = this.parseCache.get(cacheKey);

    if (cached) {
      this.parseHits++;
      this.logger.debug(`Parse cache HIT for key: ${cacheKey.substring(0, 16)}...`);
      return cached;
    }

    this.parseMisses++;
    this.logger.debug(`Parse cache MISS for key: ${cacheKey.substring(0, 16)}...`);
    return null;
  }

  /**
   * Cache parsed KHML document
   */
  setCachedParse(source: string, document: KHMLDocument): void {
    const cacheKey = this.generateCacheKey(source);

    // Implement LRU eviction if cache is full
    if (this.parseCache.size >= this.maxCacheSize) {
      const firstKey = this.parseCache.keys().next().value;
      this.parseCache.delete(firstKey);
      this.logger.debug('Parse cache eviction: removed oldest entry');
    }

    this.parseCache.set(cacheKey, document);
    this.logger.debug(`Cached parsed document: ${cacheKey.substring(0, 16)}...`);

    // Schedule cache expiration
    setTimeout(() => {
      if (this.parseCache.has(cacheKey)) {
        this.parseCache.delete(cacheKey);
        this.logger.debug(`Expired cached parse: ${cacheKey.substring(0, 16)}...`);
      }
    }, this.cacheTTL);
  }

  /**
   * Get cached rendered HTML
   */
  getCachedRender(source: string, options?: Record<string, unknown>): string | null {
    const cacheKey = this.generateRenderCacheKey(source, options);
    const cached = this.renderCache.get(cacheKey);

    if (cached) {
      this.renderHits++;
      this.logger.debug(`Render cache HIT for key: ${cacheKey.substring(0, 16)}...`);
      return cached;
    }

    this.renderMisses++;
    this.logger.debug(`Render cache MISS for key: ${cacheKey.substring(0, 16)}...`);
    return null;
  }

  /**
   * Cache rendered HTML
   */
  setCachedRender(source: string, html: string, options?: Record<string, unknown>): void {
    const cacheKey = this.generateRenderCacheKey(source, options);

    // Implement LRU eviction if cache is full
    if (this.renderCache.size >= this.maxCacheSize) {
      const firstKey = this.renderCache.keys().next().value;
      this.renderCache.delete(firstKey);
      this.logger.debug('Render cache eviction: removed oldest entry');
    }

    this.renderCache.set(cacheKey, html);
    this.logger.debug(`Cached rendered HTML: ${cacheKey.substring(0, 16)}...`);

    // Schedule cache expiration
    setTimeout(() => {
      if (this.renderCache.has(cacheKey)) {
        this.renderCache.delete(cacheKey);
        this.logger.debug(`Expired cached render: ${cacheKey.substring(0, 16)}...`);
      }
    }, this.cacheTTL);
  }

  /**
   * Invalidate all caches (useful after KHML spec changes)
   */
  invalidateAll(): void {
    const parseSize = this.parseCache.size;
    const renderSize = this.renderCache.size;

    this.parseCache.clear();
    this.renderCache.clear();

    this.logger.warn(
      `Invalidated all caches: ${parseSize} parse entries, ${renderSize} render entries`,
    );
  }

  /**
   * Invalidate cache for specific source
   */
  invalidate(source: string): void {
    const parseKey = this.generateCacheKey(source);
    const deleted = this.parseCache.delete(parseKey);

    // Also invalidate all render caches that might use this source
    let renderDeleted = 0;
    for (const [key] of this.renderCache) {
      if (key.startsWith(parseKey)) {
        this.renderCache.delete(key);
        renderDeleted++;
      }
    }

    if (deleted || renderDeleted > 0) {
      this.logger.debug(
        `Invalidated cache for source: ${parseKey.substring(0, 16)}... (${renderDeleted} render entries)`,
      );
    }
  }

  /**
   * Get cache statistics
   */
  getStatistics() {
    const parseHitRate =
      this.parseHits + this.parseMisses > 0
        ? ((this.parseHits / (this.parseHits + this.parseMisses)) * 100).toFixed(2)
        : '0.00';

    const renderHitRate =
      this.renderHits + this.renderMisses > 0
        ? ((this.renderHits / (this.renderHits + this.renderMisses)) * 100).toFixed(2)
        : '0.00';

    return {
      parse: {
        size: this.parseCache.size,
        hits: this.parseHits,
        misses: this.parseMisses,
        hitRate: `${parseHitRate}%`,
      },
      render: {
        size: this.renderCache.size,
        hits: this.renderHits,
        misses: this.renderMisses,
        hitRate: `${renderHitRate}%`,
      },
      total: {
        size: this.parseCache.size + this.renderCache.size,
        maxSize: this.maxCacheSize * 2,
        ttl: this.cacheTTL,
      },
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.parseHits = 0;
    this.parseMisses = 0;
    this.renderHits = 0;
    this.renderMisses = 0;
    this.logger.log('Cache statistics reset');
  }

  /**
   * Generate cache key from source
   */
  private generateCacheKey(source: string): string {
    // Simple hash function for cache key generation
    // In production, consider using a proper hash library
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      const char = source.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `parse_${hash.toString(36)}`;
  }

  /**
   * Generate cache key for rendered HTML (includes options)
   */
  private generateRenderCacheKey(source: string, options?: Record<string, unknown>): string {
    const baseKey = this.generateCacheKey(source);
    const optionsKey = options ? JSON.stringify(options) : '';

    let optionsHash = 0;
    for (let i = 0; i < optionsKey.length; i++) {
      const char = optionsKey.charCodeAt(i);
      optionsHash = (optionsHash << 5) - optionsHash + char;
      optionsHash = optionsHash & optionsHash;
    }

    return `render_${baseKey}_${optionsHash.toString(36)}`;
  }
}
