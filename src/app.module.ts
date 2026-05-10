import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { UsersModule } from './users/users.module';
import { UploadsModule } from './uploads/uploads.module';
import { LandingPageModule } from './landing-page/landing-page.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production.local'
          : '.env.development.local',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';

        return {
          type: 'postgres' as const,
          url: config.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: config.get('DB_SYNC') === 'true',
          logging: config.get('DB_LOGGING') === 'true',
          ssl: isProd ? { rejectUnauthorized: true } : false,
          extra: isProd ? { ssl: { rejectUnauthorized: true } } : undefined,
        };
      },
    }),
    UsersModule,
    AuthModule,
    UploadsModule,
    LandingPageModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
