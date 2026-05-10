import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ToursService } from './tours.service';

@ApiTags('tours')
@ApiCookieAuth('access_token')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        activities: { type: 'string', example: '["Senderismo","Natacion"]' },
        duration: { type: 'string' },
        number_of_people: { type: 'number' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  create(
    @Body() createTourDto: CreateTourDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.toursService.create(createTourDto, file);
  }

  @Public()
  @Get()
  findAll() {
    return this.toursService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toursService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        activities: { type: 'string', example: '["Senderismo","Natacion"]' },
        duration: { type: 'string' },
        number_of_people: { type: 'number' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateTourDto: UpdateTourDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.toursService.update(+id, updateTourDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(+id);
  }
}
