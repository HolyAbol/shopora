import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { UserEntity } from "../../services/user.entity";
import { ProductEntity } from "../products/product.entity";
@Entity("shops")
export class ShopEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", name: "shop_name" })
  shopName: string;

  @Column({ type: "int", name: "owner_id}" })
  ownerId: number;

  @Column({ type: "text" })
  status: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @Column({ type: "time", nullable: true, name: "approved_at" })
  approvedAt: Date;

  @Column({ type: "time", nullable: true, name: "rejected_at" })
  rejectedAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp", name: "deleted_at" })
  deletedAt: Date;

  @OneToOne(() => UserEntity, (user) => user.shop)
  @JoinColumn({ name: "user_id" })
  user: UserEntity;

  @OneToMany(() => ProductEntity, (product) => product.shop)
  product: ProductEntity[];
}
