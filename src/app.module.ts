import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { Cart } from './models/cart.entity';
import { CartItem } from './models/cart-item.entity';
import { Order } from './models/order.entity';
import { StatusHistory } from './models/status-history.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com',
        port: parseInt(configService.get('DB_PORT') || '5432', 10),
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || '1tCez7g1ere6DNgTwQS7',
        database: configService.get('DB_NAME') || 'cartdb',
        entities: [Cart, CartItem, Order, StatusHistory],
        synchronize: configService.get('DB_SYNC', 'false') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        ssl:
          configService.get('DB_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    CartModule,
    OrderModule,
  ],
})
export class AppModule {}
