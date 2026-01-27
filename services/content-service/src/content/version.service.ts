import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from './entities/content-version.entity';
import { Content } from './entities/content.entity';

@Injectable()
export class VersionService {
  constructor(
    @InjectRepository(ContentVersion)
    private readonly versionRepository: Repository<ContentVersion>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  /**
   * Create a new version snapshot of content
   * @param content - The content entity to create a version for
   * @param changeSummary - Optional description of what changed
   * @returns The created version entity
   */
  async createVersion(content: Content, changeSummary?: string): Promise<ContentVersion> {
    // Get the latest version number for this content
    const latestVersion = await this.versionRepository.findOne({
      where: { contentId: content.id },
      order: { versionNumber: 'DESC' },
    });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Create snapshot of current content state
    const snapshot = {
      title: content.title,
      slug: content.slug,
      description: content.description,
      contentType: content.contentType,
      tags: content.tags,
      concepts: content.concepts,
      category: content.category,
      difficulty: content.difficulty,
      status: content.status,
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      canonicalUrl: content.canonicalUrl,
      featuredImageUrl: content.featuredImageUrl,
    };

    const version = this.versionRepository.create({
      contentId: content.id,
      versionNumber,
      snapshot,
      changeSummary,
    });

    return await this.versionRepository.save(version);
  }

  /**
   * Get all versions for a specific content
   * @param contentId - The content ID
   * @returns Array of version entities
   */
  async getVersionsByContentId(contentId: string): Promise<ContentVersion[]> {
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }

    return await this.versionRepository.find({
      where: { contentId },
      order: { versionNumber: 'DESC' },
    });
  }

  /**
   * Get a specific version by ID
   * @param versionId - The version ID
   * @returns The version entity
   */
  async getVersionById(versionId: string): Promise<ContentVersion> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });

    if (!version) {
      throw new NotFoundException(`Version with ID ${versionId} not found`);
    }

    return version;
  }

  /**
   * Get a specific version by content ID and version number
   * @param contentId - The content ID
   * @param versionNumber - The version number
   * @returns The version entity
   */
  async getVersionByNumber(contentId: string, versionNumber: number): Promise<ContentVersion> {
    const version = await this.versionRepository.findOne({
      where: { contentId, versionNumber },
    });

    if (!version) {
      throw new NotFoundException(`Version ${versionNumber} not found for content ${contentId}`);
    }

    return version;
  }

  /**
   * Compare two versions and return the differences
   * @param contentId - The content ID
   * @param version1Number - First version number
   * @param version2Number - Second version number
   * @returns Object containing both versions and their differences
   */
  async compareVersions(
    contentId: string,
    version1Number: number,
    version2Number: number,
  ): Promise<{
    version1: ContentVersion;
    version2: ContentVersion;
    differences: VersionDifference[];
  }> {
    const [version1, version2] = await Promise.all([
      this.getVersionByNumber(contentId, version1Number),
      this.getVersionByNumber(contentId, version2Number),
    ]);

    const differences = this.calculateDifferences(version1.snapshot, version2.snapshot);

    return {
      version1,
      version2,
      differences,
    };
  }

  /**
   * Restore content to a specific version
   * @param contentId - The content ID
   * @param versionNumber - The version number to restore
   * @returns The updated content entity
   */
  async restoreVersion(contentId: string, versionNumber: number): Promise<Content> {
    const version = await this.getVersionByNumber(contentId, versionNumber);
    const content = await this.contentRepository.findOne({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }

    // Create a version of current state before restoring
    await this.createVersion(content, `Restoring to version ${versionNumber}`);

    // Update content with snapshot data
    Object.assign(content, {
      title: version.snapshot.title,
      description: version.snapshot.description,
      tags: version.snapshot.tags,
      concepts: version.snapshot.concepts,
      category: version.snapshot.category,
      difficulty: version.snapshot.difficulty,
      seoTitle: version.snapshot.seoTitle,
      seoDescription: version.snapshot.seoDescription,
      canonicalUrl: version.snapshot.canonicalUrl,
      featuredImageUrl: version.snapshot.featuredImageUrl,
    });

    return await this.contentRepository.save(content);
  }

  /**
   * Calculate differences between two version snapshots
   * @param snapshot1 - First snapshot
   * @param snapshot2 - Second snapshot
   * @returns Array of differences
   */
  private calculateDifferences(
    snapshot1: Record<string, unknown>,
    snapshot2: Record<string, unknown>,
  ): VersionDifference[] {
    const differences: VersionDifference[] = [];
    const fields = [
      'title',
      'slug',
      'description',
      'contentType',
      'tags',
      'concepts',
      'category',
      'difficulty',
      'status',
      'seoTitle',
      'seoDescription',
      'canonicalUrl',
      'featuredImageUrl',
    ];

    for (const field of fields) {
      const value1 = snapshot1[field];
      const value2 = snapshot2[field];

      if (JSON.stringify(value1) !== JSON.stringify(value2)) {
        differences.push({
          field,
          oldValue: value1,
          newValue: value2,
          changed: true,
        });
      }
    }

    return differences;
  }

  /**
   * Get version count for a content
   * @param contentId - The content ID
   * @returns Number of versions
   */
  async getVersionCount(contentId: string): Promise<number> {
    return await this.versionRepository.count({
      where: { contentId },
    });
  }

  /**
   * Delete old versions (keep only the last N versions)
   * @param contentId - The content ID
   * @param keepCount - Number of versions to keep (default: 10)
   * @returns Number of deleted versions
   */
  async pruneOldVersions(contentId: string, keepCount = 10): Promise<number> {
    const versions = await this.versionRepository.find({
      where: { contentId },
      order: { versionNumber: 'DESC' },
    });

    if (versions.length <= keepCount) {
      return 0;
    }

    const versionsToDelete = versions.slice(keepCount);
    await this.versionRepository.remove(versionsToDelete);

    return versionsToDelete.length;
  }
}

export interface VersionDifference {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}
