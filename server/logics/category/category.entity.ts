import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ProductCategory } from './productCategory.entity';
@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn({
    name: 'category_id',
    primaryKeyConstraintName: 'pk_category_id',
  })
  categoryId: number;

  @Column({ name: 'category_name', type: 'varchar', length: 50, unique: true })
  categoryName: string;

  @Column({ name: 'category_parent_id', type: 'int', nullable: true })
  categoryParentId: number | null;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  @JoinColumn({
    name: 'category_parent_id',
    foreignKeyConstraintName: 'fk_category_parent_id',
  })
  parent: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
  @OneToMany(() => ProductCategory, (pc) => pc.category)
  productCategories: ProductCategory[];
}
