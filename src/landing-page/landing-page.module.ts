import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingPageContent } from './entities/landing-page-content.entity';
import { LandingPageController } from './landing-page.controller';
import { LandingPageService } from './landing-page.service';

@Module({
  imports: [TypeOrmModule.forFeature([LandingPageContent])],
  controllers: [LandingPageController],
  providers: [LandingPageService],
})
export class LandingPageModule {}
