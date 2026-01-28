import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseKHMLDto {
  @ApiProperty({
    description: 'KHML source code to parse',
    example:
      '@article{\n  @meta[title="Example"]{"}\n  @content{\n    @h1{Title}\n    @paragraph{Content}\n  }\n}',
  })
  @IsString()
  @IsNotEmpty({ message: 'Source code cannot be empty' })
  source: string;
}

export class RenderKHMLDto {
  @ApiProperty({
    description: 'KHML source code to render to HTML',
    example: '@paragraph{Hello, **World**!}',
  })
  @IsString()
  @IsNotEmpty({ message: 'Source code cannot be empty' })
  source: string;

  @ApiProperty({
    description: 'Custom CSS class prefix for rendered HTML elements',
    example: 'custom-',
    required: false,
  })
  @IsString()
  @IsOptional()
  classPrefix?: string;

  @ApiProperty({
    description: 'Enable or disable HTML sanitization (default: true)',
    example: true,
    required: false,
  })
  @IsOptional()
  sanitize?: boolean;
}

export class ValidateKHMLDto {
  @ApiProperty({
    description: 'KHML source code to validate',
    example: '@paragraph{Valid KHML}',
  })
  @IsString()
  @IsNotEmpty({ message: 'Source code cannot be empty' })
  source: string;
}

export class ExtractTextDto {
  @ApiProperty({
    description: 'KHML source code to extract plain text from',
    example: '@paragraph{This is **formatted** text}',
  })
  @IsString()
  @IsNotEmpty({ message: 'Source code cannot be empty' })
  source: string;
}

export class ExtractMetadataDto {
  @ApiProperty({
    description: 'KHML source code to extract metadata from',
    example: '@article{\n  @meta[title="Example", author="John Doe"]{}\n  @content{...}\n}',
  })
  @IsString()
  @IsNotEmpty({ message: 'Source code cannot be empty' })
  source: string;
}

export class ConvertMarkdownDto {
  @ApiProperty({
    description: 'Markdown source to convert to KHML',
    example: '# Title\n\nThis is a paragraph with **bold** text.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Markdown cannot be empty' })
  markdown: string;
}

export class RenderJSONBDto {
  @ApiProperty({
    description: 'Pre-parsed JSONB document to render to HTML',
    example: {
      version: '1.0',
      blocks: [
        {
          id: 'p1',
          type: 'paragraph',
          content: 'Hello, World!',
        },
      ],
    },
  })
  @IsNotEmpty({ message: 'JSONB document cannot be empty' })
  jsonb: Record<string, unknown>;

  @ApiProperty({
    description: 'Custom CSS class prefix for rendered HTML elements',
    example: 'custom-',
    required: false,
  })
  @IsString()
  @IsOptional()
  classPrefix?: string;

  @ApiProperty({
    description: 'Enable or disable HTML sanitization (default: true)',
    example: true,
    required: false,
  })
  @IsOptional()
  sanitize?: boolean;
}
