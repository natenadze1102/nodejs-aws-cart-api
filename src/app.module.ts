import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'cart-service-db.cd66u40eafyf.eu-central-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres',
      password: '1tCez7g1ere6DNgTwQS7',
      database: 'cartdb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNC === 'true',
      logging: true,
      logger: 'advanced-console',
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),

    AuthModule,
    UsersModule,
    CartModule,
    OrderModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
