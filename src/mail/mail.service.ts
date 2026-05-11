import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';
import {
  getContactMessageAdminHtml,
  getContactMessageAdminText,
} from './templates/contact-admin.templates';
import {
  getTestMailHtml,
  getTestMailText,
  getTourReservationAdminHtml,
  getTourReservationAdminText,
  getTourReservationAttendanceConfirmationHtml,
  getTourReservationAttendanceConfirmationText,
  getTourReservationCustomerHtml,
  getTourReservationCustomerText,
} from './templates/tour-reservation.templates';

export type SendEmailOptions = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
};

@Injectable()
export class MailService {
  private readonly api: brevo.TransactionalEmailsApi;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    this.senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL') ?? '';
    this.senderName =
      this.config.get<string>('BREVO_SENDER_NAME') ?? 'Curubande Experience';

    if (!apiKey) {
      throw new Error('BREVO_API_KEY no está configurada');
    }
    if (!this.senderEmail) {
      throw new Error('BREVO_SENDER_EMAIL no está configurada');
    }

    this.api = new brevo.TransactionalEmailsApi();
    this.api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  }

  private getNotificationEmails(): string[] {
    const raw =
      this.config.get<string>('NOTIFICATION_EMAILS') ??
      this.config.get<string>('ADMIN_EMAILS') ??
      '';
    return raw
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
  }

  async sendEmail(opts: SendEmailOptions) {
    try {
      const email = new brevo.SendSmtpEmail();
      email.sender = { email: this.senderEmail, name: this.senderName };
      email.to = opts.to;
      email.subject = opts.subject;
      email.htmlContent = opts.htmlContent;
      if (opts.textContent) {
        email.textContent = opts.textContent;
      }

      return await this.api.sendTransacEmail(email);
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { status?: number; body?: unknown; data?: unknown };
        body?: unknown;
      };
      const body = err?.response?.body ?? err?.body ?? err?.response?.data;
      const bodyStr =
        typeof body === 'object' ? JSON.stringify(body) : String(body ?? '');
      console.error(
        '[Brevo] error:',
        err?.message,
        err?.response?.status,
        bodyStr,
      );
      throw new InternalServerErrorException(
        `Error enviando correo con Brevo: ${err?.message ?? 'desconocido'}`,
      );
    }
  }

  async sendTestEmail(toEmail: string, recipientName: string) {
    return this.sendEmail({
      to: [{ email: toEmail, name: recipientName }],
      subject: 'Prueba de correo - Curubande Experience',
      htmlContent: getTestMailHtml({
        recipientName,
        senderName: this.senderName,
      }),
      textContent: getTestMailText({
        recipientName,
        senderName: this.senderName,
      }),
    });
  }

  async notifyContactMessageToAdmins(params: {
    name: string;
    email: string;
    message: string;
  }) {
    const admins = this.getNotificationEmails();
    if (admins.length === 0) {
      console.warn(
        '[Mail] No hay NOTIFICATION_EMAILS ni ADMIN_EMAILS configurados; se omite aviso de contacto',
      );
      return;
    }

    const subject = `Nuevo contacto: ${params.name}`;
    const htmlContent = getContactMessageAdminHtml({
      ...params,
      senderName: this.senderName,
    });
    const textContent = getContactMessageAdminText({
      ...params,
      senderName: this.senderName,
    });

    for (const email of admins) {
      await this.sendEmail({
        to: [{ email }],
        subject,
        htmlContent,
        textContent,
      });
    }
  }

  async sendTourReservationEmails(params: {
    customerName: string;
    customerEmail: string;
    phone: string;
    tourName: string;
    reservationDate: string;
  }) {
    const dateLabel = params.reservationDate.slice(0, 10);

    await this.sendEmail({
      to: [{ email: params.customerEmail, name: params.customerName }],
      subject: `Solicitud de reserva recibida - ${params.tourName}`,
      htmlContent: getTourReservationCustomerHtml({
        customerName: params.customerName,
        tourName: params.tourName,
        date: dateLabel,
        senderName: this.senderName,
      }),
      textContent: getTourReservationCustomerText({
        customerName: params.customerName,
        tourName: params.tourName,
        date: dateLabel,
        senderName: this.senderName,
      }),
    });

    const admins = this.getNotificationEmails();
    if (admins.length === 0) {
      console.warn(
        '[Mail] No hay correos de administración; se omite aviso de reserva',
      );
      return;
    }

    const adminSubject = `Nueva reserva: ${params.tourName} - ${params.customerName}`;
    for (const email of admins) {
      await this.sendEmail({
        to: [{ email }],
        subject: adminSubject,
        htmlContent: getTourReservationAdminHtml({
          customerName: params.customerName,
          customerEmail: params.customerEmail,
          phone: params.phone,
          tourName: params.tourName,
          date: dateLabel,
          senderName: this.senderName,
        }),
        textContent: getTourReservationAdminText({
          customerName: params.customerName,
          customerEmail: params.customerEmail,
          phone: params.phone,
          tourName: params.tourName,
          date: dateLabel,
          senderName: this.senderName,
        }),
      });
    }
  }

  async sendTourReservationAttendanceConfirmation(params: {
    customerName: string;
    customerEmail: string;
    tourName: string;
    reservationDate: string;
    confirmUrl: string;
  }) {
    const dateLabel = params.reservationDate.slice(0, 10);

    await this.sendEmail({
      to: [{ email: params.customerEmail, name: params.customerName }],
      subject: `Confirma tu asistencia - ${params.tourName} (${dateLabel})`,
      htmlContent: getTourReservationAttendanceConfirmationHtml({
        customerName: params.customerName,
        tourName: params.tourName,
        date: dateLabel,
        confirmUrl: params.confirmUrl,
        senderName: this.senderName,
      }),
      textContent: getTourReservationAttendanceConfirmationText({
        customerName: params.customerName,
        tourName: params.tourName,
        date: dateLabel,
        confirmUrl: params.confirmUrl,
        senderName: this.senderName,
      }),
    });
  }
}
