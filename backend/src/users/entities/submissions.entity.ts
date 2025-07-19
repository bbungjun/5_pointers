import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Pages } from './pages.entity';

@Entity('submissions')
export class Submissions {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Pages, (page) => page.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page: Pages;

  @Column()
  component_id: string;

  @Column({ type: 'json' })
  data: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
