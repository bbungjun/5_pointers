import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, AuthProvider } from './entities/users.entity'
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async findByEmail(email: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'nickname', 'provider', 'provider_id', 'password'] });
  }

  async findBySocial(provider: AuthProvider, providerId: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { provider, provider_id: providerId } });
  }

  async createLocalUser(email: string, password: string): Promise<Users> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashed, provider: AuthProvider.LOCAL });
    return this.usersRepository.save(user);
  }

  async createSocialUser(provider: AuthProvider, providerId: string, email?: string): Promise<Users> {
    const user = this.usersRepository.create({ provider, provider_id: providerId, email });
    return this.usersRepository.save(user);
  }
}