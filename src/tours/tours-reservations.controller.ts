import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { ToursService } from './tours.service';

/**
 * Rutas de listado de reservas en un controlador aparte y registrado antes que
 * {@link ToursController}, para que Express/Nest no enrute `/tours/reservations`
 * hacia `GET /tours/:id` (id = "reservations").
 */
@ApiTags('tours')
@ApiCookieAuth('access_token')
@Controller('tours')
export class ToursReservationsController {
  constructor(private readonly toursService: ToursService) {}

  @Get('reservations')
  findAllReservations() {
    return this.toursService.findAllReservations();
  }
}
