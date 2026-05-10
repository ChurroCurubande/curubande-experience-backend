import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInAuthDto } from './dto/sign-in-auth.dto';

const getCookieOptions = (maxAge: number): CookieOptions => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge,
  };
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signIn')
  async login(
    @Body() dto: SignInAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.signIn(dto);

    res.cookie(
      'access_token',
      access_token,
      getCookieOptions(1000 * 60 * 60 * 24 * 7),
    );
    res.cookie(
      'refresh_token',
      refresh_token,
      getCookieOptions(1000 * 60 * 60 * 24 * 90),
    );

    return { message: 'Inicio de sesión exitoso', access_token };
  }

  @ApiCookieAuth('access_token')
  @Get('me')
  async me(@Req() req: Request & { user?: { id_user: number } }) {
    return this.authService.getProfile(req.user!.id_user);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Token de refresco no encontrado');
    }

    const { access_token } = await this.authService.refreshToken(refreshToken);

    res.cookie(
      'access_token',
      access_token,
      getCookieOptions(1000 * 60 * 60 * 24 * 7),
    );

    return { message: 'Token actualizado correctamente' };
  }

  @Public()
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
    };

    res.clearCookie('access_token', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    return { message: 'Cierre de sesión exitoso' };
  }
}
