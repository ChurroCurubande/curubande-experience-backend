import {
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { LandingPageService } from './landing-page.service';

@ApiTags('landing-page')
@Controller('landing-page')
export class LandingPageController {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Public()
  @Get('hero')
  getHero() {
    return this.landingPageService.getHero();
  }

  @Patch('hero')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  updateHero(@UploadedFile() file: Express.Multer.File) {
    return this.landingPageService.updateHero(file);
  }
}
