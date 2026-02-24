import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('discord')
  @ApiOperation({ summary: 'Redirect to Discord OAuth2' })
  discordLogin(@Res() res: Response) {
    const url = this.authService.getDiscordAuthUrl();
    return res.redirect(url);
  }

  @Get('discord/callback')
  @ApiOperation({ summary: 'Discord OAuth2 callback' })
  async discordCallback(@Query('code') code: string, @Res() res: Response) {
    const tokens = await this.authService.exchangeCode(code);
    // Return tokens as JSON (frontend will store them)
    return res.json(tokens);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT access token' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  getMe(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (client-side token discard)' })
  logout() {
    // JWT is stateless — client discards the token
    return { message: 'Logged out successfully' };
  }
}
