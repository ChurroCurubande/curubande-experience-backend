export const TOUR_RESERVATION_STATUSES = [
  'pending',
  'client_contacted',
  'confirmed',
] as const;

export type TourReservationStatus = (typeof TOUR_RESERVATION_STATUSES)[number];
