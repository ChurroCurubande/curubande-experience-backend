import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CreateTourDto } from './dto/create-tour.dto';
import { RemoveTourGalleryItemDto } from './dto/remove-tour-gallery-item.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ToursService } from './tours.service';

@ApiTags('tours')
@ApiCookieAuth('access_token')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'gallery', maxCount: 20 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        activities: { type: 'string', example: '["Senderismo","Natacion"]' },
        duration: { type: 'string' },
        number_of_people: { type: 'number' },
        file: { type: 'string', format: 'binary' },
        gallery: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  create(
    @Body() createTourDto: CreateTourDto,
    @UploadedFiles()
    files?: {
      file?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return this.toursService.create(createTourDto, files);
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'gallery', maxCount: 20 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        activities: { type: 'string', example: '["Senderismo","Natacion"]' },
        duration: { type: 'string' },
        number_of_people: { type: 'number' },
        file: { type: 'string', format: 'binary' },
        gallery: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateTourDto: UpdateTourDto,
    @UploadedFiles()
    files?: {
      file?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return this.toursService.update(+id, updateTourDto, files);
  }

  @Post(':id/gallery')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'gallery', maxCount: 20 }]))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        gallery: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  addGallery(
    @Param('id') id: string,
    @UploadedFiles()
    files?: {
      gallery?: Express.Multer.File[];
    },
  ) {
    return this.toursService.addGallery(+id, files?.gallery ?? []);
  }

  @Delete(':id/gallery')
  removeGalleryItem(
    @Param('id') id: string,
    @Body() removeTourGalleryItemDto: RemoveTourGalleryItemDto,
  ) {
    return this.toursService.removeGalleryItem(
      +id,
      removeTourGalleryItemDto.path,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.toursService.remove(+id);
  }
}
