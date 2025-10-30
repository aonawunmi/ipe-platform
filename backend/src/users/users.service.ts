import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = this.usersRepository.create({
      email: userData.email,
      passwordHash,
      fullName: userData.fullName,
      phone: userData.phone,
    });

    return this.usersRepository.save(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Validate user password
   */
  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLoginAt: new Date(),
    });
  }

  /**
   * Check if account is active
   */
  async isAccountActive(user: User): Promise<boolean> {
    return user.isActive;
  }
}
