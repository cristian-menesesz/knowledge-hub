import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Content } from './content.entity';

@Entity('content_versions')
@Index(['contentId'])
export class ContentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'content_id' })
  contentId: string;

  @Column({ type: 'int', name: 'version_number' })
  versionNumber: number;

  @Column({ type: 'jsonb' })
  snapshot: Record<string, unknown>;

  @Column({ type: 'text', nullable: true, name: 'change_summary' })
  changeSummary: string;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: Content;
}
