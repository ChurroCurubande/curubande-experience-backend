import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { CreateTourReservationDto } from './dto/create-tour-reservation.dto';
import { ConfirmTourReservationAttendanceDto } from './dto/confirm-tour-reservation-attendance.dto';
import { UpdateTourReservationStatusDto } from './dto/update-tour-reservation-status.dto';
import { TourClick } from './entities/tour-click.entity';
import { TourReservation } from './entities/tour-reservation.entity';
import { Tour, TourGalleryItem } from './entities/tour.entity';
import { addCalendarDaysToYmd, formatYmdInTimeZone } from './utils/reservation-date.utils';

type TourFiles = {
  file?: Express.Multer.File[];
  gallery?: Express.Multer.File[];
};

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(TourClick)
    private readonly tourClickRepository: Repository<TourClick>,
    @InjectRepository(TourReservation)
    private readonly tourReservationRepository: Repository<TourReservation>,
    private readonly uploadsService: UploadsService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
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

  async recordClick(tourId: number) {
    const exists = await this.tourRepository.exist({
      where: { id_tour: tourId },
    });

    if (!exists) {
      throw new NotFoundException('Tour no encontrado');
    }

    await this.tourClickRepository.save({
      tour: { id_tour: tourId } as Tour,
    });

    return { recorded: true as const };
  }

  async createReservation(tourId: number, dto: CreateTourReservationDto) {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: tourId },
    });

    if (!tour) {
      throw new NotFoundException('Tour no encontrado');
    }

    const reservation = this.tourReservationRepository.create({
      tour: { id_tour: tourId } as Tour,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      reservation_date: dto.date.slice(0, 10),
      status: 'pending',
      confirmation_token: randomUUID(),
      attendance_reminder_sent_at: null,
    });

    const saved = await this.tourReservationRepository.save(reservation);

    void this.mailService
      .sendTourReservationEmails({
        customerName: dto.name,
        customerEmail: dto.email,
        phone: dto.phone,
        tourName: tour.name,
        reservationDate: dto.date,
      })
      .catch((err: unknown) => {
        console.error('[Mail] aviso de reserva falló:', err);
      });

    return this.mapReservationPublic(saved, tourId, tour.name);
  }

  async findAllReservations() {
    const rows = await this.tourReservationRepository.find({
      relations: ['tour'],
      order: { reservation_date: 'ASC', created_at: 'DESC' },
    });

    return rows.map((r) => this.mapReservationListItem(r));
  }

  async updateReservationStatus(
    reservationId: number,
    dto: UpdateTourReservationStatusDto,
  ) {
    const row = await this.tourReservationRepository.findOne({
      where: { id_reservation: reservationId },
      relations: ['tour'],
    });

    if (!row) {
      throw new NotFoundException('Reservación no encontrada');
    }

    row.status = dto.status;
    await this.tourReservationRepository.save(row);

    return this.mapReservationListItem(row);
  }

  async confirmAttendanceByToken(dto: ConfirmTourReservationAttendanceDto) {
    const row = await this.tourReservationRepository.findOne({
      where: { confirmation_token: dto.token },
      relations: ['tour'],
    });

    if (!row) {
      throw new NotFoundException('Enlace inválido o ya no es válido');
    }

    if (row.status === 'confirmed') {
      return {
        ok: true as const,
        message: 'Esta reserva ya estaba confirmada.',
      };
    }

    row.status = 'confirmed';
    await this.tourReservationRepository.save(row);

    return {
      ok: true as const,
      message: 'Gracias, hemos registrado tu asistencia.',
    };
  }

  /**
   * Invocado por el cron diario a mediodía: reservas con fecha = mañana (zona CR u otra),
   * estado pendiente o cliente contactado, sin recordatorio enviado aún.
   */
  async sendAttendanceRemindersForTomorrow(): Promise<number> {
    const tz =
      this.config.get<string>('RESERVATION_REMINDER_TIMEZONE') ??
      'America/Costa_Rica';
    const todayYmd = formatYmdInTimeZone(new Date(), tz);
    const tomorrowYmd = addCalendarDaysToYmd(todayYmd, 1);

    const rows = await this.tourReservationRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.tour', 'tour')
      .where('r.reservation_date = :target', { target: tomorrowYmd })
      .andWhere('r.status IN (:...allowed)', {
        allowed: ['pending', 'client_contacted'],
      })
      .andWhere('r.attendance_reminder_sent_at IS NULL')
      .getMany();

    let sent = 0;

    for (const row of rows) {
      try {
        if (!row.confirmation_token) {
          row.confirmation_token = randomUUID();
          await this.tourReservationRepository.save(row);
        }

        const tourName = row.tour?.name ?? 'Tour';
        const confirmUrl = this.buildAttendanceConfirmUrl(row.confirmation_token);
        const reservationDate = this.normalizeReservationDateValue(
          row.reservation_date,
        );

        await this.mailService.sendTourReservationAttendanceConfirmation({
          customerName: row.name,
          customerEmail: row.email,
          tourName,
          reservationDate,
          confirmUrl,
        });

        row.attendance_reminder_sent_at = new Date();
        await this.tourReservationRepository.save(row);
        sent += 1;
      } catch (err: unknown) {
        console.error(
          `[Reserva ${row.id_reservation}] error enviando recordatorio de asistencia:`,
          err,
        );
      }
    }

    return sent;
  }

  async getClickStats() {
    const total_clicks = await this.tourClickRepository.count();

    const topToursRaw = await this.tourClickRepository
      .createQueryBuilder('c')
      .innerJoin('tours', 't', 't.id_tour = c.tour_id')
      .select('t.id_tour', 'tour_id')
      .addSelect('t.name', 'name')
      .addSelect('COUNT(*)', 'clicks')
      .groupBy('t.id_tour')
      .addGroupBy('t.name')
      .orderBy('clicks', 'DESC')
      .addOrderBy('t.name', 'ASC')
      .limit(15)
      .getRawMany<{ tour_id: string; name: string; clicks: string }>();

    const topDaysRaw = await this.tourClickRepository
      .createQueryBuilder('c')
      .select("to_char((c.clicked_at AT TIME ZONE 'UTC')::date, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'clicks')
      .groupBy("(c.clicked_at AT TIME ZONE 'UTC')::date")
      .orderBy('clicks', 'DESC')
      .addOrderBy('date', 'DESC')
      .limit(30)
      .getRawMany<{ date: string; clicks: string }>();

    return {
      total_clicks,
      top_tours: topToursRaw.map((row) => ({
        tour_id: Number(row.tour_id),
        name: row.name,
        clicks: Number(row.clicks),
      })),
      top_days: topDaysRaw.map((row) => ({
        date: row.date,
        clicks: Number(row.clicks),
      })),
    };
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

  async addGallery(id: number, files: Express.Multer.File[]) {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new NotFoundException('Tour no encontrado');
    }

    const gallery = [
      ...(tour.gallery ?? []),
      ...(await this.uploadGallery(files)),
    ];

    tour.gallery = gallery;

    return this.toResponse(await this.tourRepository.save(tour));
  }

  async removeGalleryItem(id: number, path: string) {
    const tour = await this.tourRepository.findOne({
      where: { id_tour: id },
    });

    if (!tour) {
      throw new NotFoundException('Tour no encontrado');
    }

    const gallery = tour.gallery ?? [];
    const nextGallery = gallery.filter((item) => item.path !== path);

    if (nextGallery.length === gallery.length) {
      throw new NotFoundException('Archivo de galería no encontrado');
    }

    tour.gallery = nextGallery;

    return this.toResponse(await this.tourRepository.save(tour));
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

  private normalizeReservationDateValue(value: string | Date): string {
    const dateVal = value as unknown;
    if (typeof dateVal === 'string') {
      return dateVal.slice(0, 10);
    }
    if (dateVal instanceof Date) {
      return dateVal.toISOString().slice(0, 10);
    }
    return String(dateVal).slice(0, 10);
  }

  private buildAttendanceConfirmUrl(token: string): string {
    const base = (
      this.config.get<string>('PUBLIC_APP_URL') ?? 'http://localhost:3001'
    ).replace(/\/$/, '');
    return `${base}/reserva/confirmar?token=${encodeURIComponent(token)}`;
  }

  private mapReservationListItem(r: TourReservation) {
    const reservation_date = this.normalizeReservationDateValue(
      r.reservation_date,
    );
    const tour = r.tour;

    return {
      id_reservation: r.id_reservation,
      id_tour: tour?.id_tour ?? 0,
      tour_name: tour?.name ?? 'Tour no disponible',
      name: r.name,
      email: r.email,
      phone: r.phone,
      reservation_date,
      created_at: r.created_at,
      status: r.status,
      attendance_reminder_sent_at: r.attendance_reminder_sent_at,
    };
  }

  private mapReservationPublic(
    r: TourReservation,
    id_tour: number,
    tour_name: string,
  ) {
    const reservation_date = this.normalizeReservationDateValue(
      r.reservation_date,
    );

    return {
      id_reservation: r.id_reservation,
      id_tour,
      tour_name,
      name: r.name,
      email: r.email,
      phone: r.phone,
      reservation_date,
      created_at: r.created_at,
      status: r.status,
    };
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
