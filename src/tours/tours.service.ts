import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadsService } from '../uploads/uploads.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour } from './entities/tour.entity';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(createTourDto: CreateTourDto, file?: Express.Multer.File) {
    const previewImagePath = file
      ? await this.uploadsService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          'landing',
          'tours',
        )
      : null;

    const tour = this.tourRepository.create({
      ...createTourDto,
      preview_image_path: previewImagePath,
    });

    return this.toResponse(await this.tourRepository.save(tour));
  }

  async findAll() {
    const tours = await this.tourRepository.find({
      order: { created_at: 'DESC' },
    });

    return tours.map((tour) => this.toResponse(tour));
  }

  async findOne(id: number) {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new NotFoundException('Tour no encontrado');
    }

    return this.toResponse(tour);
  }

  async update(
    id: number,
    updateTourDto: UpdateTourDto,
    file?: Express.Multer.File,
  ) {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new NotFoundException('Tour no encontrado');
    }

    const previewImagePath = file
      ? await this.uploadsService.uploadFile(
          file.buffer,
          file.originalname,
          file.mimetype,
          'landing',
          'tours',
        )
      : tour.preview_image_path;

    const updatedTour = Object.assign(tour, updateTourDto, {
      preview_image_path: previewImagePath,
    });

    return this.toResponse(await this.tourRepository.save(updatedTour));
  }

  async remove(id: number) {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new NotFoundException('Tour no encontrado');
    }

    await this.tourRepository.remove(tour);

    return { message: 'Tour eliminado correctamente' };
  }

  private toResponse(tour: Tour) {
    return {
      ...tour,
      preview_image_url: tour.preview_image_path
        ? this.uploadsService.getPublicUrl(tour.preview_image_path)
        : null,
    };
  }
}
