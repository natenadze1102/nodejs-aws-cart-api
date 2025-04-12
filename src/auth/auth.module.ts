import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
// Fix the import path to explicitly import from the correct location
import { BasicStrategy } from './strategies/basic.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

import { JWT_CONFIG } from '../constants';
import { UsersModule } from '../users/users.module';

const { secret, expiresIn } = JWT_CONFIG;

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({ secret, signOptions: { expiresIn } }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, BasicStrategy],
  exports: [AuthService],
})
export class AuthModule {}
