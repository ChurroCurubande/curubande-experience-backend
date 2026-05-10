import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthPayload } from '../types/auth-payload.type';

const getCookieOptions = (maxAge: number) => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    path: '/',
    maxAge,
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractToken(request);

    if (!token) {
      const refreshed = await this.tryAutoRefresh(request, response);

      if (!refreshed) {
        throw new UnauthorizedException('No se proporcionó un token');
      }

      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthPayload>(token);
      request.user = {
        id_user: payload.sub,
        username: payload.username,
        email: payload.email,
      };
    } catch {
      const refreshed = await this.tryAutoRefresh(request, response);

      if (!refreshed) {
        throw new UnauthorizedException('Token inválido');
      }
    }

    return true;
  }

  private async tryAutoRefresh(
    request: Request,
    response: Response,
  ): Promise<boolean> {
    const refreshToken = request.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      return false;
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AuthPayload>(refreshToken);
      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: payload.sub,
          username: payload.username,
          email: payload.email,
        },
        { expiresIn: '7d' },
      );

      response.cookie(
        'access_token',
        newAccessToken,
        getCookieOptions(1000 * 60 * 60 * 24 * 7),
      );

      request.user = {
        id_user: payload.sub,
        username: payload.username,
        email: payload.email,
      };

      return true;
    } catch {
      return false;
    }
  }

  private extractToken(request: Request): string | undefined {
    const cookieToken = request.cookies?.access_token as string | undefined;

    if (cookieToken) {
      return cookieToken;
    }

    const [type, accessToken] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? accessToken : undefined;
  }
}
