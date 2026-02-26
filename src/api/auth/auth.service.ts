import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppHttpService } from '../../shared/http';
import type { JwtPayload } from './strategies/jwt.strategy';

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: AppHttpService,
  ) {}

  getDiscordAuthUrl(): string {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const redirectUri = this.configService.get<string>('DISCORD_CALLBACK_URL');
    const scopes = ['identify', 'guilds'].join('%20');
    return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&response_type=code&scope=${scopes}`;
  }

  async exchangeCode(code: string): Promise<AuthTokens> {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'DISCORD_CLIENT_SECRET',
    );
    const redirectUri = this.configService.get<string>('DISCORD_CALLBACK_URL');

    // Exchange code for Discord tokens
    const tokenRes = await this.httpService.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri!,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    const discordTokens: DiscordTokenResponse =
      tokenRes.data as DiscordTokenResponse;

    // Get Discord user info
    const userRes = await this.httpService.get(
      'https://discord.com/api/users/@me',
      {
        headers: { Authorization: `Bearer ${discordTokens.access_token}` },
      },
    );

    const discordUser: DiscordUser = userRes.data as DiscordUser;

    // Validate: must be bot owner
    const ownerId = this.configService.get<string>('OWNER_ID');
    if (discordUser.id !== ownerId) {
      throw new UnauthorizedException('Access denied. You are not authorized.');
    }

    return this.generateTokens(discordUser);
  }

  refreshTokens(refreshToken: string): AuthTokens {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Re-validate owner
      const ownerId = this.configService.get<string>('OWNER_ID');
      if (payload.sub !== ownerId) {
        throw new UnauthorizedException('Access denied.');
      }

      return this.generateTokens({
        id: payload.sub,
        username: payload.username,
        avatar: payload.avatar,
        discriminator: '0',
        global_name: null,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private generateTokens(user: DiscordUser): AuthTokens {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      avatar: user.avatar || '',
      role: 'superadmin',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '3d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
