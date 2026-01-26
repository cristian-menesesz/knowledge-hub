import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Profile } from 'passport-github2';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ||
        'http://localhost:3001/api/v1/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile
  ): Promise<{
    githubId: string;
    email: string | undefined;
    username: string | undefined;
    name: string | undefined;
    avatarUrl: string | undefined;
    provider: string;
  }> {
    const { id, username, emails, photos, displayName } = profile;

    const user = {
      githubId: id,
      email: emails?.[0]?.value,
      username: username || displayName,
      name: displayName,
      avatarUrl: photos?.[0]?.value,
      provider: 'github',
    };

    return user;
  }
}
