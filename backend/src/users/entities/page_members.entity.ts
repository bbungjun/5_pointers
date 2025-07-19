import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Pages } from './pages.entity';
import { Users } from './users.entity';

@Entity('page_members')
export class PageMembers {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Pages, (page) => page.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageId' })
  page: Pages;

  @ManyToOne(() => Users, (user) => user.pageMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @Column({ default: 'EDITOR' })
  role: string;

  @Column({ default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  invitation_token: string;

  @Column({ nullable: true })
  expires_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
