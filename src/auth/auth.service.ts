import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SignInAuthDto } from './dto/sign-in-auth.dto';
import { AuthPayload } from './types/auth-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async signIn(
    dto: SignInAuthDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.usersService.findByUsernameOrEmail(
      dto.usernameOrEmail,
    );

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Contrasena incorrecta');
    }

    const payload = {
      sub: user.id_user,
      username: user.username,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '90d',
    });

    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload =
        await this.jwtService.verifyAsync<AuthPayload>(refreshToken);
      const user = await this.usersRepository.findOne({
        where: { id_user: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const access_token = await this.jwtService.signAsync(
        {
          sub: user.id_user,
          username: user.username,
          email: user.email,
        },
        { expiresIn: '7d' },
      );

      return { access_token };
    } catch {
      throw new UnauthorizedException('Refresh token invalido o expirado');
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id_user: userId },
      select: ['id_user', 'username', 'email'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
