import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * Add KHML Support to Content Entities
 *
 * This migration adds columns for storing KHML content in Article and Guide entities:
 * - body_source: Stores raw KHML source code (TEXT)
 * - Updates body column comment to indicate it stores parsed KHML JSONB
 *
 * The body column already exists as JSONB and will now store parsed KHML documents.
 * The new body_source column stores the original KHML for version control and re-parsing.
 */
export class AddKHMLSupport1706400000000 implements MigrationInterface {
  name = 'AddKHMLSupport1706400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add body_source column to articles table
    await queryRunner.addColumn(
      'articles',
      new TableColumn({
        name: 'body_source',
        type: 'text',
        isNullable: true,
        comment: 'Original KHML source code for version control and re-parsing',
      }),
    );

    // Add body_source column to guides table
    await queryRunner.addColumn(
      'guides',
      new TableColumn({
        name: 'body_source',
        type: 'text',
        isNullable: true,
        comment: 'Original KHML source code for version control and re-parsing',
      }),
    );

    // Update comment on existing body column to clarify it stores parsed KHML
    await queryRunner.query(`
      COMMENT ON COLUMN articles.body IS 'Parsed KHML document in JSONB format (KHMLDocument structure)';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN guides.body IS 'Parsed KHML document in JSONB format (KHMLDocument structure)';
    `);

    console.log('✅ Added KHML support columns to articles and guides tables');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove body_source column from articles table
    await queryRunner.dropColumn('articles', 'body_source');

    // Remove body_source column from guides table
    await queryRunner.dropColumn('guides', 'body_source');

    // Restore original comment on body column
    await queryRunner.query(`
      COMMENT ON COLUMN articles.body IS 'Block-based content structure (from editor)';
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN guides.body IS 'Block-based content structure';
    `);

    console.log('✅ Removed KHML support columns from articles and guides tables');
  }
}
