import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from '../../services/user.entity';
import { Order } from '../order/orders.entity';
@Entity({ name: 'addresses' })
export class Address {
  @PrimaryGeneratedColumn({ name: 'address_id', primaryKeyConstraintName: 'pk_address_id' })
  addressId: number;

  @Column({ name: 'user_id', type: 'int', unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.address, { nullable: false })
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'fk_address_user_id' })
  user: User;

  @Column({ name: 'address_title', type: 'varchar', length: 15 })
  addressTitle: string;

  @Column({ name: 'country_code', type: 'char', length: 2 })
  countryCode: string;

  @Column({ type: 'varchar', length: 20 })
  province: string;

  @Column({ type: 'varchar', length: 20 })
  city: string;

  @Column({ name: 'address_detail', type: 'text' })
  addressDetail: string;

  @Column({ name: 'postal_code', type: 'char', length: 10 })
  postalCode: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Order, (order) => order.address)
  orders: Order[];
}
