import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Cart } from './carts.entity';
import { Product } from '../products/product.entity';
@Entity({ name: 'cart_items' })
@Check('chk_quantity', `"quantity" > 0`)
export class CartItem {
  @PrimaryColumn({
    name: 'cart_id',
    type: 'int',
    primaryKeyConstraintName: 'pk_cart_item',
  })
  cartId: number;

  @PrimaryColumn({
    name: 'product_id',
    type: 'int',
    primaryKeyConstraintName: 'pk_cart_item',
  })
  productId: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { nullable: false })
  @JoinColumn({ name: 'cart_id', foreignKeyConstraintName: 'fk_cart_item' })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, { nullable: false })
  @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_cart_product' })
  product: Product;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
