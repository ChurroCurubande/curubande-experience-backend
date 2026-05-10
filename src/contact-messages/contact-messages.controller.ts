import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';

@ApiTags('contact-messages')
@ApiCookieAuth('access_token')
@Controller('contact-messages')
export class ContactMessagesController {
  constructor(
    private readonly contactMessagesService: ContactMessagesService,
  ) {}

  @Public()
  @Post()
  create(@Body() createContactMessageDto: CreateContactMessageDto) {
    return this.contactMessagesService.create(createContactMessageDto);
  }

  @Get()
  findAll() {
    return this.contactMessagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactMessagesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContactMessageDto: UpdateContactMessageDto,
  ) {
    return this.contactMessagesService.update(+id, updateContactMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactMessagesService.remove(+id);
  }
}
