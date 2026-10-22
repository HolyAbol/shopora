import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { CartItem } from './cartItems.entity';
@Entity({ name: 'carts' })
@Unique('uq_user_id', ['userId'])
export class Cart {
  @PrimaryGeneratedColumn({ name: 'cart_id', primaryKeyConstraintName: 'pk_cart_id' })
  cartId: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.cart, { nullable: false })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
  @OneToMany(() => CartItem, (item) => item.cart)
  items: CartItem[];
}
