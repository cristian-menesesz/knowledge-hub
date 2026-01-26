import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import type { PrismaService } from '../prisma/prisma.service';

import type {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  ChangePasswordDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto
  ): Promise<Omit<User, 'passwordHash'>> {
    const { email, password, ...rest } = createUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check username uniqueness if provided
    if (rest.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: rest.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username is already taken');
      }
    }

    // Hash password if provided (for local auth)
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        ...rest,
      },
    });

    this.logger.log(`User created: ${user.id}`);

    // Remove sensitive data
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<Omit<User, 'passwordHash'>[]> {
    const { skip, take, role, isActive } = params || {};

    const users = await this.prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      skip,
      take: take || 50,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(({ passwordHash: _passwordHash, ...user }) => user);
  }

  async findOne(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(
    username: string
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) return null;

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<Omit<User, 'passwordHash'>> {
    // Check if user exists
    await this.findOne(id);

    // Check username uniqueness if being updated
    if (updateUserDto.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: updateUserDto.username },
      });

      if (existingUsername && existingUsername.id !== id) {
        throw new ConflictException('Username is already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    this.logger.log(`User updated: ${id}`);

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateUserRoleDto
  ): Promise<Omit<User, 'passwordHash'>> {
    await this.findOne(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: updateRoleDto.role },
    });

    this.logger.log(`User role updated: ${id} -> ${updateRoleDto.role}`);

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'User does not have a password (OAuth user)'
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      this.SALT_ROUNDS
    );

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });

    this.logger.log(`Password changed for user: ${id}`);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);

    // Soft delete - deactivate user
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`User soft deleted: ${id}`);
  }

  async hardDelete(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    this.logger.log(`User hard deleted: ${id}`);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async validatePassword(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
