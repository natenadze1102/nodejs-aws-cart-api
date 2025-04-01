import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async createOne(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }
}
