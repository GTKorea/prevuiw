import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private config: ConfigService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.validateOAuthUser(req.user);

    // Check if this is an SDK popup flow (SDK sets a cookie before opening the popup)
    const isSdk = req.cookies?.prevuiw_sdk_auth === '1';
    if (isSdk) {
      res.clearCookie('prevuiw_sdk_auth');
      const payload = JSON.stringify({
        type: "prevuiw:auth",
        token: result.accessToken,
        user: result.user,
      });
      res.setHeader('Content-Type', 'text/html');
      res.send(`<!DOCTYPE html><html><body><script>
        window.opener.postMessage(${payload}, "*");
        window.close();
      </script></body></html>`);
      return;
    }

    const frontendUrl = this.config.get('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.validateOAuthUser(req.user);
    const frontendUrl = this.config.get('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
  }

  // SDK auth: sets a cookie marker, then redirects to Google OAuth
  @Get('google/sdk')
  googleSdkAuth(@Res() res: Response) {
    const apiUrl = this.config.get('API_URL') || 'http://localhost:3012';
    res.cookie('prevuiw_sdk_auth', '1', {
      httpOnly: true,
      maxAge: 300000, // 5 minutes
      sameSite: 'lax',
    });
    res.redirect(`${apiUrl}/auth/google`);
  }
}
