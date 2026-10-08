import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  DeleteDateColumn,
} from 'typeorm';
import { Order } from './orders.entity';
import { Product } from '../products/product.entity';

@Entity({ name: 'order_items' })
@Check('chk_order_quantity', `"quantity" > 0`)
export class OrderItem {
  @PrimaryColumn({ name: 'order_id', type: 'int', primaryKeyConstraintName: 'pk_order_item' })
  orderId: number;

  @PrimaryColumn({ name: 'product_id', type: 'int', primaryKeyConstraintName: 'pk_order_item' })
  productId: number;

  @ManyToOne(() => Order, (order) => order.items, { nullable: false })
  @JoinColumn({ name: 'order_id', foreignKeyConstraintName: 'fk_order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems, { nullable: false })
  @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_product_id' })
  product: Product;

  @Column({ name: 'product_name', type: 'varchar', length: 50 })
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'int' })
  unitPrice: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
