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
} from "typeorm";
import { ShopEntity } from "../logics/shop/shop.entity";
@Entity("users")
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: false, unique: true })
  username: string;

  @Column({ type: "text", nullable: false })
  password: string;

  @Column({ type: "text", nullable: false, unique: true })
  email: string;

  @Column({ type: "text", nullable: false, name: "first_name" })
  firstName: string;

  @Column({ type: "text", nullable: false, name: "last_name" })
  lastName: string;

  @Column({ type: "int", nullable: false, unique: true, name: "phone_number" })
  phoneNumber: number;

  @Column({ type: "text", nullable: false, default: "user" })
  role: string;

  @Column({ type: "time", default: true, nullable: false })
  lastActivity: boolean;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp", name: "deleted_at" })
  deletedAt: Date;
  @OneToOne(() => ShopEntity, (shop) => shop.user)
  shop: ShopEntity;
}
