import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionService } from './version.service';
import { ContentVersion } from './entities/content-version.entity';
import { Content, ContentStatus, ContentType, ContentDifficulty } from './entities/content.entity';
import { NotFoundException } from '@nestjs/common';

describe('VersionService', () => {
  let service: VersionService;
  let versionRepository: jest.Mocked<Repository<ContentVersion>>;
  let contentRepository: jest.Mocked<Repository<Content>>;

  const mockContent = {
    id: 'content-123',
    title: 'Test Content',
    slug: 'test-content',
    description: 'Test description',
    contentType: ContentType.ARTICLE,
    tags: ['test'],
    concepts: ['testing'],
    category: 'Testing',
    difficulty: ContentDifficulty.BEGINNER,
    status: ContentStatus.DRAFT,
    authorId: 'author-123',
    seoTitle: 'Test SEO Title',
    seoDescription: 'Test SEO Description',
    canonicalUrl: 'https://example.com/test',
    featuredImageUrl: 'https://example.com/image.jpg',
    viewsCount: 0,
    likesCount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as Content;

  const mockVersion = {
    id: 'version-123',
    contentId: 'content-123',
    versionNumber: 1,
    snapshot: {
      title: 'Test Content',
      slug: 'test-content',
      description: 'Test description',
      contentType: ContentType.ARTICLE,
      tags: ['test'],
      concepts: ['testing'],
      category: 'Testing',
      difficulty: ContentDifficulty.BEGINNER,
      status: ContentStatus.DRAFT,
      seoTitle: 'Test SEO Title',
      seoDescription: 'Test SEO Description',
      canonicalUrl: 'https://example.com/test',
      featuredImageUrl: 'https://example.com/image.jpg',
    },
    changeSummary: 'Initial version',
    createdBy: 'author-123',
    createdAt: new Date('2024-01-01'),
  } as unknown as ContentVersion;

  beforeEach(async () => {
    const mockVersionRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
    };

    const mockContentRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VersionService,
        {
          provide: getRepositoryToken(ContentVersion),
          useValue: mockVersionRepository,
        },
        {
          provide: getRepositoryToken(Content),
          useValue: mockContentRepository,
        },
      ],
    }).compile();

    service = module.get<VersionService>(VersionService);
    versionRepository = module.get(getRepositoryToken(ContentVersion));
    contentRepository = module.get(getRepositoryToken(Content));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVersion', () => {
    it('should create first version with version number 1', async () => {
      versionRepository.findOne.mockResolvedValue(null); // No previous versions
      versionRepository.create.mockReturnValue(mockVersion);
      versionRepository.save.mockResolvedValue(mockVersion);

      const result = await service.createVersion(mockContent, 'Initial version');

      expect(versionRepository.findOne).toHaveBeenCalledWith({
        where: { contentId: mockContent.id },
        order: { versionNumber: 'DESC' },
      });
      expect(versionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          contentId: mockContent.id,
          versionNumber: 1,
          changeSummary: 'Initial version',
        }),
      );
      expect(result).toEqual(mockVersion);
    });

    it('should increment version number based on latest version', async () => {
      const latestVersion = { ...mockVersion, versionNumber: 5 };
      versionRepository.findOne.mockResolvedValue(latestVersion);
      versionRepository.create.mockReturnValue({ ...mockVersion, versionNumber: 6 });
      versionRepository.save.mockResolvedValue({ ...mockVersion, versionNumber: 6 });

      await service.createVersion(mockContent);

      expect(versionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          versionNumber: 6,
        }),
      );
    });

    it('should create snapshot with all content fields', async () => {
      versionRepository.findOne.mockResolvedValue(null);
      versionRepository.create.mockReturnValue(mockVersion);
      versionRepository.save.mockResolvedValue(mockVersion);

      await service.createVersion(mockContent);

      expect(versionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          snapshot: expect.objectContaining({
            title: mockContent.title,
            slug: mockContent.slug,
            description: mockContent.description,
            contentType: mockContent.contentType,
            tags: mockContent.tags,
            concepts: mockContent.concepts,
            category: mockContent.category,
            difficulty: mockContent.difficulty,
            status: mockContent.status,
          }),
        }),
      );
    });
  });

  describe('getVersionsByContentId', () => {
    it('should return all versions for a content', async () => {
      const versions = [mockVersion, { ...mockVersion, id: 'version-456', versionNumber: 2 }];
      contentRepository.findOne.mockResolvedValue(mockContent);
      versionRepository.find.mockResolvedValue(versions);

      const result = await service.getVersionsByContentId('content-123');

      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'content-123' },
      });
      expect(versionRepository.find).toHaveBeenCalledWith({
        where: { contentId: 'content-123' },
        order: { versionNumber: 'DESC' },
      });
      expect(result).toEqual(versions);
    });

    it('should throw NotFoundException if content not found', async () => {
      contentRepository.findOne.mockResolvedValue(null);

      await expect(service.getVersionsByContentId('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(versionRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('getVersionById', () => {
    it('should return version by ID', async () => {
      versionRepository.findOne.mockResolvedValue(mockVersion);

      const result = await service.getVersionById('version-123');

      expect(versionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'version-123' },
      });
      expect(result).toEqual(mockVersion);
    });

    it('should throw NotFoundException if version not found', async () => {
      versionRepository.findOne.mockResolvedValue(null);

      await expect(service.getVersionById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVersionByNumber', () => {
    it('should return version by content ID and version number', async () => {
      versionRepository.findOne.mockResolvedValue(mockVersion);

      const result = await service.getVersionByNumber('content-123', 1);

      expect(versionRepository.findOne).toHaveBeenCalledWith({
        where: { contentId: 'content-123', versionNumber: 1 },
      });
      expect(result).toEqual(mockVersion);
    });

    it('should throw NotFoundException if version not found', async () => {
      versionRepository.findOne.mockResolvedValue(null);

      await expect(service.getVersionByNumber('content-123', 99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions and return differences', async () => {
      const version1 = mockVersion;
      const version2 = {
        ...mockVersion,
        id: 'version-456',
        versionNumber: 2,
        snapshot: {
          ...mockVersion.snapshot,
          title: 'Updated Title',
          description: 'Updated description',
        },
      };

      versionRepository.findOne.mockResolvedValueOnce(version1).mockResolvedValueOnce(version2);

      const result = await service.compareVersions('content-123', 1, 2);

      expect(result.version1).toEqual(version1);
      expect(result.version2).toEqual(version2);
      expect(result.differences).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            oldValue: 'Test Content',
            newValue: 'Updated Title',
            changed: true,
          }),
          expect.objectContaining({
            field: 'description',
            oldValue: 'Test description',
            newValue: 'Updated description',
            changed: true,
          }),
        ]),
      );
    });
  });

  describe('restoreVersion', () => {
    it('should restore content to a specific version', async () => {
      const version = mockVersion;
      versionRepository.findOne.mockResolvedValue(version);
      contentRepository.findOne.mockResolvedValue(mockContent);
      versionRepository.create.mockReturnValue({} as unknown as never);
      versionRepository.save.mockResolvedValue({} as unknown as never);

      const restoredContent = { ...mockContent };
      contentRepository.save.mockResolvedValue(restoredContent);

      const result = await service.restoreVersion('content-123', 1);

      // Should create backup version before restoring
      expect(versionRepository.create).toHaveBeenCalled();
      // Should save updated content
      expect(contentRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if content not found', async () => {
      versionRepository.findOne.mockResolvedValue(mockVersion);
      contentRepository.findOne.mockResolvedValue(null);

      await expect(service.restoreVersion('non-existent', 1)).rejects.toThrow(NotFoundException);
      expect(contentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getVersionCount', () => {
    it('should return version count for content', async () => {
      versionRepository.count.mockResolvedValue(5);

      const result = await service.getVersionCount('content-123');

      expect(versionRepository.count).toHaveBeenCalledWith({
        where: { contentId: 'content-123' },
      });
      expect(result).toBe(5);
    });
  });

  describe('pruneOldVersions', () => {
    it('should delete old versions keeping specified count', async () => {
      const versions = Array.from({ length: 15 }, (_, i) => ({
        ...mockVersion,
        id: `version-${i}`,
        versionNumber: 15 - i,
      }));

      versionRepository.find.mockResolvedValue(versions);
      versionRepository.remove.mockResolvedValue([] as unknown as never);

      const result = await service.pruneOldVersions('content-123', 10);

      expect(versionRepository.find).toHaveBeenCalledWith({
        where: { contentId: 'content-123' },
        order: { versionNumber: 'DESC' },
      });
      expect(versionRepository.remove).toHaveBeenCalledWith(versions.slice(10));
      expect(result).toBe(5);
    });

    it('should not delete versions if count is below threshold', async () => {
      const versions = Array.from({ length: 5 }, (_, i) => ({
        ...mockVersion,
        id: `version-${i}`,
        versionNumber: i + 1,
      }));

      versionRepository.find.mockResolvedValue(versions);

      const result = await service.pruneOldVersions('content-123', 10);

      expect(versionRepository.remove).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });
});
