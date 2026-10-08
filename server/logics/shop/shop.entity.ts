import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../services/user.entity';
import { Product } from '../products/product.entity';

export type ShopStatus = 'waiting for approval' | 'approved' | 'rejected';

@Entity({ name: 'shops' })
@Check('chk_status', `"status" IN ('waiting for approval', 'approved', 'rejected')`)
export class Shop {
  @PrimaryGeneratedColumn({ name: 'shop_id' })
  shopId: number;

  @Column({ name: 'owner_id', type: 'int', unique: true })
  ownerId: number;

  @ManyToOne(() => User, (user) => user.shops, { nullable: false })
  @JoinColumn({ name: 'owner_id', foreignKeyConstraintName: 'fk_owner_id' })
  owner: User;

  @Column({ name: 'shop_name', type: 'varchar', length: 100, unique: true })
  shopName: string;

  @Column({ type: 'varchar', length: 40 })
  status: ShopStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];
}
