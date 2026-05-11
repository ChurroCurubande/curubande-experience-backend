-- Ejecutar en PostgreSQL si no usas DB_SYNC=true (columnas nuevas en tour_reservations)

ALTER TABLE tour_reservations
  ADD COLUMN IF NOT EXISTS status varchar(32) NOT NULL DEFAULT 'pending';

ALTER TABLE tour_reservations
  ADD COLUMN IF NOT EXISTS confirmation_token varchar(36);

ALTER TABLE tour_reservations
  ADD COLUMN IF NOT EXISTS attendance_reminder_sent_at timestamptz;
