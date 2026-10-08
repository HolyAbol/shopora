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
import { Address } from '../address/addresses.entity';
import { OrderItem } from './orderItems.entity';
export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'sourcing'
  | 'warehouse'
  | 'packaging'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash_on_delivery' | 'online_payment' | 'installment';

@Entity({ name: 'orders' })
@Check(
  'chk_payment_method',
  `"payment_method" IN ('cash_on_delivery', 'online_payment', 'installment')`
)
@Check(
  'chk_status',
  `"status" IN ('pending_payment', 'processing', 'sourcing', 'warehouse', 'packaging', 'shipped', 'delivered', 'cancelled')`
)
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id', primaryKeyConstraintName: 'pk_order_id' })
  orderId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_order_user_id' })
  user: User;

  @Column({ name: 'address_id', type: 'int' })
  addressId: number;

  @ManyToOne(() => Address, (address) => address.orders, { nullable: false })
  @JoinColumn({ name: 'address_id', foreignKeyConstraintName: 'fk_order_address_id' })
  address: Address;

  @Column({ name: 'total_amount', type: 'int' })
  totalAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'pending_payment' })
  status: OrderStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 20 })
  paymentMethod: PaymentMethod;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
