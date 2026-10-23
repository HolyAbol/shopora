import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Cart } from '../cart/carts.entity';
import { Address } from '../address/addresses.entity';
import { Order } from '../order/orders.entity';
import { Shop } from '../shop/shop.entity';
export type UserRole = 'user' | 'admin' | 'owner';

@Entity('users')
@Index('users_username_unique_active', ['username'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('users_email_unique_active', ['email'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Index('users_phone_number_unique_active', ['phoneNumber'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
@Check('chk_role', `"role" IN ('user', 'admin', 'owner')`)
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', primaryKeyConstraintName: 'pk_user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 30 })
  username: string;

  @Column({ type: 'varchar', length: 60, select: false })
  password: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 11 })
  phoneNumber: string;

  @Column({ name: 'first_name', type: 'varchar', length: 20, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', type: 'varchar', length: 20, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 10, default: 'user' })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'last_activity', type: 'timestamp', default: () => 'NOW()' })
  lastActivity: Date;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;
  @OneToOne(() => Address, (address) => address.user)
  address: Address;
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
  @OneToMany(() => Shop, (shop) => shop.owner)
  shops: Shop[];
}
