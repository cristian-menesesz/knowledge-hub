import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentService } from './content.service';
import { VersionService } from './version.service';
import { Content, ContentStatus, ContentType, ContentDifficulty } from './entities/content.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

describe('ContentService', () => {
  let service: ContentService;
  let contentRepository: jest.Mocked<Repository<Content>>;
  let versionService: jest.Mocked<VersionService>;

  const mockContent = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Content',
    slug: 'test-content',
    description: 'Test description',
    contentType: ContentType.ARTICLE,
    tags: ['test', 'unit'],
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

  beforeEach(async () => {
    const mockContentRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
      softRemove: jest.fn(),
      increment: jest.fn(),
    };

    const mockVersionService = {
      createVersion: jest.fn(),
      getVersionsByContentId: jest.fn(),
      getVersionById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getRepositoryToken(Content),
          useValue: mockContentRepository,
        },
        {
          provide: VersionService,
          useValue: mockVersionService,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    contentRepository = module.get(getRepositoryToken(Content));
    versionService = module.get(VersionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create new content successfully', async () => {
      const createDto: CreateContentDto = {
        title: 'Test Content',
        slug: 'test-content',
        description: 'Test description',
        contentType: ContentType.ARTICLE,
        tags: ['test'],
        concepts: ['testing'],
        category: 'Testing',
        difficulty: ContentDifficulty.BEGINNER,
        authorId: 'author-123',
      };

      contentRepository.findOne.mockResolvedValue(null);
      contentRepository.create.mockReturnValue(mockContent);
      contentRepository.save.mockResolvedValue(mockContent);

      const result = await service.create(createDto);

      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { slug: createDto.slug },
      });
      expect(contentRepository.create).toHaveBeenCalledWith(createDto);
      expect(contentRepository.save).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockContent);
    });

    it('should throw ConflictException if slug already exists', async () => {
      const createDto: CreateContentDto = {
        title: 'Test Content',
        slug: 'test-content',
        description: 'Test description',
        contentType: ContentType.ARTICLE,
        tags: ['test'],
        concepts: ['testing'],
        category: 'Testing',
        difficulty: ContentDifficulty.BEGINNER,
        authorId: 'author-123',
      };

      contentRepository.findOne.mockResolvedValue(mockContent);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(contentRepository.findOne).toHaveBeenCalledWith({
        where: { slug: createDto.slug },
      });
      expect(contentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated content list', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockContent], 1]),
      };

      contentRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as ReturnType<typeof contentRepository.createQueryBuilder>,
      );

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual({ data: [mockContent], total: 1 });
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('content.createdAt', 'DESC');
    });

    it('should apply filters when provided', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockContent], 1]),
      };

      contentRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as ReturnType<typeof contentRepository.createQueryBuilder>,
      );

      await service.findAll({
        status: ContentStatus.PUBLISHED,
        contentType: ContentType.ARTICLE,
        authorId: 'author-123',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('content.status = :status', {
        status: ContentStatus.PUBLISHED,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('content.contentType = :contentType', {
        contentType: ContentType.ARTICLE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('content.authorId = :authorId', {
        authorId: 'author-123',
      });
    });
  });

  describe('findOne', () => {
    it('should return content by ID', async () => {
      contentRepository.findOne.mockResolvedValue(mockContent);

      const result = await service.findOne(mockContent.id);

      expect(contentRepository.findOne).toHaveBeenCalledWith({ where: { id: mockContent.id } });
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      contentRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(contentRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-id' } });
    });
  });

  describe('findBySlug', () => {
    it('should return content by slug', async () => {
      contentRepository.findOne.mockResolvedValue(mockContent);

      const result = await service.findBySlug(mockContent.slug);

      expect(contentRepository.findOne).toHaveBeenCalledWith({ where: { slug: mockContent.slug } });
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      contentRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update content successfully', async () => {
      const updateDto: UpdateContentDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedContent = { ...mockContent, ...updateDto };

      contentRepository.findOne
        .mockResolvedValueOnce(mockContent) // findOne call
        .mockResolvedValueOnce(null); // slug uniqueness check
      versionService.createVersion.mockResolvedValue({} as unknown as never);
      contentRepository.save.mockResolvedValue(updatedContent);

      const result = await service.update(mockContent.id, updateDto);

      expect(versionService.createVersion).toHaveBeenCalledWith(mockContent, 'Content updated');
      expect(contentRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should throw ConflictException if new slug already exists', async () => {
      const updateDto: UpdateContentDto = {
        slug: 'existing-slug',
      };

      const existingContent = { ...mockContent, id: 'different-id' };

      contentRepository.findOne
        .mockResolvedValueOnce(mockContent) // findOne call
        .mockResolvedValueOnce(existingContent); // slug uniqueness check

      await expect(service.update(mockContent.id, updateDto)).rejects.toThrow(ConflictException);
      expect(versionService.createVersion).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete content', async () => {
      contentRepository.findOne.mockResolvedValue(mockContent);
      contentRepository.softRemove.mockResolvedValue(mockContent);

      await service.remove(mockContent.id);

      expect(contentRepository.findOne).toHaveBeenCalledWith({ where: { id: mockContent.id } });
      expect(contentRepository.softRemove).toHaveBeenCalledWith(mockContent);
    });

    it('should throw NotFoundException if content not found', async () => {
      contentRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(contentRepository.softRemove).not.toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should publish draft content', async () => {
      const publishedContent = {
        ...mockContent,
        status: ContentStatus.PUBLISHED,
        publishedAt: expect.any(Date),
      };

      contentRepository.findOne.mockResolvedValue(mockContent);
      contentRepository.save.mockResolvedValue(publishedContent);

      const result = await service.publish(mockContent.id);

      expect(contentRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(ContentStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
    });

    it('should throw ConflictException if already published', async () => {
      const publishedContent = { ...mockContent, status: ContentStatus.PUBLISHED };
      contentRepository.findOne.mockResolvedValue(publishedContent);

      await expect(service.publish(mockContent.id)).rejects.toThrow(ConflictException);
      expect(contentRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count', async () => {
      contentRepository.increment.mockResolvedValue({} as unknown as never);

      await service.incrementViewCount(mockContent.id);

      expect(contentRepository.increment).toHaveBeenCalledWith(
        { id: mockContent.id },
        'viewsCount',
        1,
      );
    });
  });

  describe('incrementLikeCount', () => {
    it('should increment like count', async () => {
      contentRepository.increment.mockResolvedValue({} as unknown as never);

      await service.incrementLikeCount(mockContent.id);

      expect(contentRepository.increment).toHaveBeenCalledWith(
        { id: mockContent.id },
        'likesCount',
        1,
      );
    });
  });
});
