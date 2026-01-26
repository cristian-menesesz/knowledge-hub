import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';

import type { PrismaService } from '../prisma/prisma.service';
import type { UsersService } from '../users/users.service';

import type { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = await this.usersService.create({
      email,
      password,
      displayName: name,
      username: email.split('@')[0], // Generate username from email
    });

    this.logger.log(`User registered: ${user.email}`);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.displayName,
        role: user.role,
      },
    };
  }

  async login(user: Omit<User, 'passwordHash'>) {
    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.displayName,
        role: user.role,
      },
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prismaService.session.deleteMany({
      where: {
        userId,
        refreshToken,
      },
    });

    this.logger.log(`User logged out: ${userId}`);
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'your-refresh-secret',
      });

      // Find session
      const session = await this.prismaService.session.findFirst({
        where: {
          refreshToken,
          userId: payload.sub,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(session.user);

      // Update session
      await this.prismaService.session.update({
        where: { id: session.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async handleOAuthLogin(oauthUser: {
    email: string;
    provider: string;
    name?: string;
    username?: string;
    avatarUrl?: string;
    githubId?: string;
    googleId?: string;
  }) {
    const { email, provider } = oauthUser;

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user from OAuth profile
      await this.usersService.create({
        email: email,
        displayName: oauthUser.name,
        username: oauthUser.username || email.split('@')[0],
        avatarUrl: oauthUser.avatarUrl,
        oauthProvider: provider,
        oauthId: oauthUser.githubId || oauthUser.googleId || null,
        // No password for OAuth users
      });

      this.logger.log(`New user created via ${provider}: ${email}`);

      // Fetch the full user to ensure we have all fields
      user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Failed to create user');
      }
    } else {
      // Update OAuth info if not set
      const oauthId = oauthUser.githubId || oauthUser.googleId;
      if (oauthId && user.oauthId !== oauthId) {
        await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: provider,
            oauthId: oauthId,
          },
        });
      }

      // Update last login
      await this.usersService.updateLastLogin(user.id);

      this.logger.log(`Existing user logged in via ${provider}: ${email}`);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.displayName,
        role: user.role,
      },
    };
  }

  private async generateTokens(user: Omit<User, 'passwordHash'>) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'your-refresh-secret',
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async createSession(userId: string, refreshToken: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prismaService.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });
  }
}
