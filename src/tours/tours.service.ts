import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadsService } from '../uploads/uploads.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour, TourGalleryItem } from './entities/tour.entity';

type TourFiles = {
  file?: Express.Multer.File[];
  gallery?: Express.Multer.File[];
};

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(createTourDto: CreateTourDto, files?: TourFiles) {
    const previewImagePath = await this.uploadPreviewImage(files?.file?.[0]);
    const gallery = await this.uploadGallery(files?.gallery ?? []);

    const tour = this.tourRepository.create({
      ...createTourDto,
      preview_image_path: previewImagePath,
      gallery,
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

  async update(id: number, updateTourDto: UpdateTourDto, files?: TourFiles) {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new NotFoundException('Tour no encontrado');
    }

    const previewImagePath = files?.file?.[0]
      ? await this.uploadPreviewImage(files.file[0])
      : tour.preview_image_path;
    const gallery = [
      ...(tour.gallery ?? []),
      ...(await this.uploadGallery(files?.gallery ?? [])),
    ];

    const updatedTour = Object.assign(tour, updateTourDto, {
      preview_image_path: previewImagePath,
      gallery,
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
      gallery: (tour.gallery ?? []).map((item) => ({
        ...item,
        url: this.uploadsService.getPublicUrl(item.path),
      })),
    };
  }

  private uploadPreviewImage(file?: Express.Multer.File) {
    if (!file) return null;

    return this.uploadsService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'landing',
      'tours',
    );
  }

  private async uploadGallery(files: Express.Multer.File[]) {
    const gallery: TourGalleryItem[] = [];

    for (const file of files) {
      const path = await this.uploadsService.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'landing',
        'tours-gallery',
      );

      gallery.push({
        path,
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
        mime_type: file.mimetype,
        original_name: file.originalname,
      });
    }

    return gallery;
  }
}
