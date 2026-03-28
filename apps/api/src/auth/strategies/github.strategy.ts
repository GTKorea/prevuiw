import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get('GITHUB_CLIENT_ID') ?? '',
      clientSecret: config.get('GITHUB_CLIENT_SECRET') ?? '',
      callbackURL: config.get('GITHUB_CALLBACK_URL') ?? '',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
      name: profile.displayName || profile.username,
      avatarUrl: profile.photos?.[0]?.value,
      provider: 'GITHUB' as const,
      providerId: profile.id,
    };
  }
}
