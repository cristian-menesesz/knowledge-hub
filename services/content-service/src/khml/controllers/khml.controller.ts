import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { KHMLService } from '../services/khml.service';
import {
  ParseKHMLDto,
  RenderKHMLDto,
  ValidateKHMLDto,
  ExtractTextDto,
  ExtractMetadataDto,
  ConvertMarkdownDto,
} from '../dto/khml.dto';

@ApiTags('KHML')
@Controller('khml')
export class KHMLController {
  constructor(private readonly khmlService: KHMLService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parse KHML to structured JSONB',
    description: 'Converts KHML source code to structured JSONB format for database storage',
  })
  @ApiBody({ type: ParseKHMLDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully parsed KHML',
    schema: {
      example: {
        version: '1.0',
        blocks: [
          {
            id: 'block-1',
            type: 'heading',
            level: 1,
            content: 'Example Title',
          },
        ],
        metadata: {
          title: 'Example',
          author: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid KHML syntax',
  })
  parse(@Body() dto: ParseKHMLDto) {
    return this.khmlService.parseToJSONB(dto.source);
  }

  @Post('render')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Render KHML to HTML',
    description: 'Converts KHML source code directly to HTML for display',
  })
  @ApiBody({ type: RenderKHMLDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully rendered HTML',
    schema: {
      type: 'string',
      example: '<article class="khml-document">...</article>',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid KHML syntax',
  })
  render(@Body() dto: RenderKHMLDto) {
    return {
      html: this.khmlService.renderToHTML(dto.source),
    };
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate KHML syntax',
    description: 'Checks KHML source code for syntax errors without parsing or rendering',
  })
  @ApiBody({ type: ValidateKHMLDto })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      example: {
        valid: true,
        errors: [],
      },
    },
  })
  validate(@Body() dto: ValidateKHMLDto) {
    return this.khmlService.validate(dto.source);
  }

  @Post('extract-text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extract plain text from KHML',
    description: 'Extracts plain text content for search indexing',
  })
  @ApiBody({ type: ExtractTextDto })
  @ApiResponse({
    status: 200,
    description: 'Extracted plain text',
    schema: {
      type: 'string',
      example: 'Introduction to Algorithms Algorithms are step-by-step procedures...',
    },
  })
  extractText(@Body() dto: ExtractTextDto) {
    return {
      text: this.khmlService.extractPlainText(dto.source),
    };
  }

  @Post('extract-metadata')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extract metadata from KHML',
    description: 'Extracts document metadata (title, author, tags, etc.)',
  })
  @ApiBody({ type: ExtractMetadataDto })
  @ApiResponse({
    status: 200,
    description: 'Extracted metadata',
    schema: {
      example: {
        title: 'Introduction to Algorithms',
        author: 'John Doe',
        tags: ['algorithms', 'computer-science'],
        difficulty: 'intermediate',
        estimatedReadingTime: 10,
      },
    },
  })
  extractMetadata(@Body() dto: ExtractMetadataDto) {
    return this.khmlService.extractMetadata(dto.source);
  }

  @Post('convert/markdown')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Convert Markdown to KHML',
    description: 'Converts Markdown format to KHML (basic conversion)',
  })
  @ApiBody({ type: ConvertMarkdownDto })
  @ApiResponse({
    status: 200,
    description: 'Converted KHML',
    schema: {
      type: 'string',
      example: '@article{\n  @content{\n    @h1{Title}\n  }\n}',
    },
  })
  convertMarkdown(@Body() dto: ConvertMarkdownDto) {
    return {
      khml: this.khmlService.convertFromMarkdown(dto.markdown),
    };
  }
}
