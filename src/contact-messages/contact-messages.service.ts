import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactMessageDto } from './dto/update-contact-message.dto';
import { ContactMessage } from './entities/contact-message.entity';

@Injectable()
export class ContactMessagesService {
  constructor(
    @InjectRepository(ContactMessage)
    private readonly contactMessageRepository: Repository<ContactMessage>,
    private readonly mailService: MailService,
  ) {}

  async create(createContactMessageDto: CreateContactMessageDto) {
    const contactMessage = this.contactMessageRepository.create({
      ...createContactMessageDto,
      is_read: false,
    });

    const saved = await this.contactMessageRepository.save(contactMessage);

    void this.mailService
      .notifyContactMessageToAdmins({
        name: saved.name,
        email: saved.email,
        message: saved.message,
      })
      .catch((err: unknown) => {
        console.error('[Mail] aviso de contacto falló:', err);
      });

    return saved;
  }

  findAll() {
    return this.contactMessageRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const contactMessage = await this.contactMessageRepository.findOne({
      where: { id_contact_message: id },
    });

    if (!contactMessage) {
      throw new NotFoundException('Mensaje de contacto no encontrado');
    }

    return contactMessage;
  }

  async update(id: number, updateContactMessageDto: UpdateContactMessageDto) {
    const contactMessage = await this.findOne(id);
    const updatedContactMessage = Object.assign(
      contactMessage,
      updateContactMessageDto,
    );

    return this.contactMessageRepository.save(updatedContactMessage);
  }

  async remove(id: number) {
    const contactMessage = await this.findOne(id);

    await this.contactMessageRepository.remove(contactMessage);

    return { message: 'Mensaje de contacto eliminado correctamente' };
  }
}
