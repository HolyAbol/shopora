import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { User } from '../logics/auth/user.entity';
import { Cart } from '../logics/cart/carts.entity';
import { CartItem } from '../logics/cart/cartItems.entity';
import { Address } from '../logics/address/addresses.entity';
import { Order } from '../logics/order/orders.entity';
import { OrderItem } from '../logics/order/orderItems.entity';
import { Product } from '../logics/products/product.entity';
import { Manufacturer } from '../logics/manufacture/manufacture.entity';
import { Shop } from '../logics/shop/shop.entity';
import { Category } from '../logics/category/category.entity';
import { ProductCategory } from '../logics/category/productCategory.entity';
import { configDotenv } from 'dotenv';
configDotenv();
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Cart,
    Address,
    Order,
    OrderItem,
    Product,
    Manufacturer,
    Shop,
    Category,
    ProductCategory,
    CartItem,
  ],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
  logging: true,
});
