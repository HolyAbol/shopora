import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';

@Entity({ name: 'manufacturers' })
export class Manufacturer {
  @PrimaryGeneratedColumn({
    name: 'manufacturer_id',
    primaryKeyConstraintName: 'pk_manufacturer_id',
  })
  manufacturerId: number;

  @Column({ name: 'manufacturer_name', type: 'varchar', length: 100, unique: true })
  manufacturerName: string;

  @Column({ name: 'country_code', type: 'char', length: 2 })
  countryCode: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Product, (product) => product.manufacturer)
  products: Product[];
}
