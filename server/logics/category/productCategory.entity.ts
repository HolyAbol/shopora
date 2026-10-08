import { Entity, PrimaryColumn, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { Category } from './category.entity';

@Entity({ name: 'product_categories' })
export class ProductCategory {
  @PrimaryColumn({
    name: 'product_id',
    type: 'int',
    primaryKeyConstraintName: 'pk_product_categories',
  })
  productId: number;

  @PrimaryColumn({
    name: 'category_id',
    type: 'int',
    primaryKeyConstraintName: 'pk_product_categories',
  })
  categoryId: number;

  @ManyToOne(() => Product, (product) => product.productCategories, { nullable: false })
  @JoinColumn({ name: 'product_id', foreignKeyConstraintName: 'fk_product_id' })
  product: Product;

  @ManyToOne(() => Category, (category) => category.productCategories, { nullable: false })
  @JoinColumn({ name: 'category_id', foreignKeyConstraintName: 'fk_category_id' })
  category: Category;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
