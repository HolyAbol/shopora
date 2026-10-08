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
import { Shop } from '../shop/shop.entity';
import { Manufacturer } from '../manufacture/manufacture.entity';
import { OrderItem } from '../order/orderItems.entity';
import { ProductCategory } from '../category/productCategory.entity';
import { CartItem } from '../cart/cartItems.entity';
@Entity({ name: 'products' })
@Check('chk_availability', `"quantity" >= 0`)
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id', primaryKeyConstraintName: 'pk_product_id' })
  productId: number;

  @Column({ name: 'product_name', type: 'varchar', length: 50 })
  productName: string;

  @Column({ name: 'shop_id', type: 'int' })
  shopId: number;

  @ManyToOne(() => Shop, (shop) => shop.products, { nullable: false })
  @JoinColumn({ name: 'shop_id', foreignKeyConstraintName: 'fk_shop_id' })
  shop: Shop;

  @Column({ name: 'manufacturer_id', type: 'int' })
  manufacturerId: number;

  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.products, { nullable: false })
  @JoinColumn({ name: 'manufacturer_id', foreignKeyConstraintName: 'fk_manufacturer_id' })
  manufacturer: Manufacturer;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true, nullable: true })
  isActive: boolean | null;

  @Column({ name: 'low_stock_threshold', type: 'int', default: 5, nullable: true })
  lowStockThreshold: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
  @OneToMany(() => ProductCategory, (pc) => pc.product)
  productCategories: ProductCategory[];
  @OneToMany(() => CartItem, (item) => item.product)
  cartItems: CartItem[];
}
