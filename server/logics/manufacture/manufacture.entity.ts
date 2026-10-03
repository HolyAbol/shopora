import {
  BaseEntity,
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { ProductEntity } from "../products/product.entity";
@Entity("manufacturers")
export class ManufacturerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", name: "manufacturer_name" })
  manufactureName: string;

  @Column({ type: "text", name: "country_code" })
  countryCode: string;

  @CreateDateColumn({ type: "timestamp without time zone", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp with time zone", name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "time with time zone", name: "deleted_at" })
  deletedAt: Date;
  @OneToMany(() => ProductEntity, (product) => product.manufacture)
  product: ProductEntity[];
}
