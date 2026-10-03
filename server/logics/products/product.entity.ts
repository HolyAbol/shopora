import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ManufacturerEntity } from "../manufacture/manufacture.entity";
import { ShopEntity } from "../shop/shop.entity";
@Entity("products")
export class productEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: false, name: "product_name" })
  name: string;

  @Column({ type: "int", nullable: false })
  quantity: number;

  @Column({ type: "int", nullable: false })
  price: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive: boolean;

  @Column({ type: "int", default: 5, nullable: true })
  lowStockThreshold: number;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp", name: "deleted_at" })
  deletedAt: Date;
  @ManyToOne(() => ManufacturerEntity, (manufacture) => manufacture.product)
  @JoinColumn({ name: "id" })
  manufacture: ManufacturerEntity;
  @ManyToOne(() => ShopEntity, (shop) => shop.product)
  @JoinColumn({ name: "id" })
  shop: ShopEntity;
}
