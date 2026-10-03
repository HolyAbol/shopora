import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { productEntity } from "../products/product.entity";
@Entity("categories")
export class categoryEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", name: "category_name" })
  categoryName: string;

  @Column({ type: "int", name: "category_parent_id", nullable: true })
  categoryParentId: number;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => categoryEntity, (category) => category.child, {
    nullable: true,
  })
  @JoinColumn({ name: "category_parent_id" })
  parent: categoryEntity;

  @OneToMany(() => categoryEntity, (category) => category.parent)
  child: categoryEntity[];

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp", name: "deleted_at" })
  deletedAt: Date;
  
}
