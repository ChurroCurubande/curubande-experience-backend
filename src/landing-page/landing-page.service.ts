import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingPageContent } from './entities/landing-page-content.entity';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class LandingPageService {
  constructor(
    @InjectRepository(LandingPageContent)
    private readonly landingRepository: Repository<LandingPageContent>,
    private readonly uploadsService: UploadsService,
  ) {}

  async getHero() {
    let content = await this.landingRepository.findOne({ where: { id: 1 } });
    
    if (!content) {
      // Crear registro inicial si no existe
      content = this.landingRepository.create({ id: 1, hero_image_path: null });
      await this.landingRepository.save(content);
    }

    return {
      hero_image_path: content.hero_image_path,
      hero_image_url: content.hero_image_path 
        ? this.uploadsService.getPublicUrl(content.hero_image_path)
        : null,
    };
  }

  async updateHero(file: Express.Multer.File) {
    let content = await this.landingRepository.findOne({ where: { id: 1 } });
//
    if (!content) {
      content = this.landingRepository.create({ id: 1 });
    }

    const path = await this.uploadsService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'landing',
      'hero'
    );

    content.hero_image_path = path;
    content.updated_at = new Date();
    
    await this.landingRepository.save(content);

    return {
      message: 'Imagen del hero actualizada correctamente',
      hero_image_path: content.hero_image_path,
      hero_image_url: this.uploadsService.getPublicUrl(content.hero_image_path),
    };
  }
}
//