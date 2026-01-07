import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './Account.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ type: 'int', unsigned: true })
  age!: number;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender!: Gender;

  @Column({ name: 'account_id', unique: true })
  accountId!: number;

  @OneToOne(() => Account, { eager: false })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
