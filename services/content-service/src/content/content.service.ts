import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentStatus } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { VersionService } from './version.service';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
    @Inject(forwardRef(() => VersionService))
    private versionService: VersionService,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    // Check if slug already exists
    const existingContent = await this.contentRepository.findOne({
      where: { slug: createContentDto.slug },
    });

    if (existingContent) {
      throw new ConflictException(`Content with slug '${createContentDto.slug}' already exists`);
    }

    const content = this.contentRepository.create(createContentDto);
    return await this.contentRepository.save(content);
  }

  async findAll(options?: {
    status?: ContentStatus;
    contentType?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Content[]; total: number }> {
    const query = this.contentRepository.createQueryBuilder('content');

    // Filters
    if (options?.status) {
      query.andWhere('content.status = :status', { status: options.status });
    }

    if (options?.contentType) {
      query.andWhere('content.contentType = :contentType', { contentType: options.contentType });
    }

    if (options?.authorId) {
      query.andWhere('content.authorId = :authorId', { authorId: options.authorId });
    }

    // Pagination
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    query.take(limit).skip(offset);

    // Order by most recent
    query.orderBy('content.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });

    if (!content) {
      throw new NotFoundException(`Content with ID '${id}' not found`);
    }

    return content;
  }

  async findBySlug(slug: string): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { slug } });

    if (!content) {
      throw new NotFoundException(`Content with slug '${slug}' not found`);
    }

    return content;
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    const content = await this.findOne(id);

    // Check slug uniqueness if being updated
    if (updateContentDto.slug && updateContentDto.slug !== content.slug) {
      const existingContent = await this.contentRepository.findOne({
        where: { slug: updateContentDto.slug },
      });

      if (existingContent) {
        throw new ConflictException(`Content with slug '${updateContentDto.slug}' already exists`);
      }
    }

    // Create version snapshot before updating (automatic versioning)
    await this.versionService.createVersion(
      content,
      updateContentDto.changeSummary || 'Content updated',
    );

    Object.assign(content, updateContentDto);
    return await this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const content = await this.findOne(id);
    await this.contentRepository.softRemove(content);
  }

  async publish(id: string): Promise<Content> {
    const content = await this.findOne(id);

    if (content.status === ContentStatus.PUBLISHED) {
      throw new ConflictException('Content is already published');
    }

    content.status = ContentStatus.PUBLISHED;
    content.publishedAt = new Date();

    return await this.contentRepository.save(content);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.contentRepository.increment({ id }, 'viewsCount', 1);
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.contentRepository.increment({ id }, 'likesCount', 1);
  }
}
