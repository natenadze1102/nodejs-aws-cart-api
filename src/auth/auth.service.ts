import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/models/user.entity';

type TokenResponse = {
  token_type: string;
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: Partial<User>): Promise<{ userId: string }> {
    // Use payload.username instead of payload.name.
    const user = await this.usersService.findOne(payload.username);
    if (user) {
      throw new BadRequestException('User with such username already exists');
    }
    const createdUser = await this.usersService.createOne(payload);
    return { userId: createdUser.id };
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === password) {
      return user;
    }
    // In case the user is not found, you might want to throw an error or create new user.
    // For example, to create a new user:
    return await this.usersService.createOne({ username, password });
  }

  login(user: User, type: 'jwt' | 'basic' | 'default'): TokenResponse {
    const LOGIN_MAP = {
      jwt: this.loginJWT.bind(this),
      basic: this.loginBasic.bind(this),
      default: this.loginJWT.bind(this),
    };
    const login = LOGIN_MAP[type];
    return login ? login(user) : LOGIN_MAP.default(user);
  }

  loginJWT(user: User): TokenResponse {
    const payload = { username: user.username, sub: user.id };
    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  loginBasic(user: User): TokenResponse {
    function encodeUserToken(user: User) {
      const { username, password } = user;
      const buf = Buffer.from(`${username}:${password}`, 'utf8');
      return buf.toString('base64');
    }
    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
