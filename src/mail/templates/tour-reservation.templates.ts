function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getTourReservationCustomerHtml(params: {
  customerName: string;
  tourName: string;
  date: string;
  senderName: string;
}): string {
  const customerName = escapeHtml(params.customerName);
  const tourName = escapeHtml(params.tourName);
  const date = escapeHtml(params.date);

  return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
        <div style="background:#2d6a4f;padding:28px 24px;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">Solicitud de reserva recibida</h2>
        </div>
        <div style="padding:24px">
          <p style="font-size:15px;line-height:1.6;color:#333">Hola ${customerName},</p>
          <p style="font-size:15px;line-height:1.6;color:#333">
            Hemos recibido tu solicitud de reserva. Nos pondremos en contacto contigo pronto para confirmar disponibilidad y detalles.
          </p>
          <div style="background:#f4f9f6;border-left:4px solid #2d6a4f;padding:14px;margin:20px 0;font-size:14px;color:#444;">
            <strong>Tour:</strong> ${tourName}<br/>
            <strong>Fecha deseada:</strong> ${date}
          </div>
          <p style="color:#666;font-size:13px;margin-top:24px">${escapeHtml(params.senderName)}</p>
        </div>
      </div>
    `;
}

export function getTourReservationCustomerText(params: {
  customerName: string;
  tourName: string;
  date: string;
  senderName: string;
}): string {
  return `Hola ${params.customerName},

Hemos recibido tu solicitud de reserva. Nos pondremos en contacto contigo pronto para confirmar disponibilidad y detalles.

Tour: ${params.tourName}
Fecha deseada: ${params.date}

${params.senderName}
`;
}

export function getTourReservationAdminHtml(params: {
  customerName: string;
  customerEmail: string;
  phone: string;
  tourName: string;
  date: string;
  senderName: string;
}): string {
  const customerName = escapeHtml(params.customerName);
  const customerEmail = escapeHtml(params.customerEmail);
  const phone = escapeHtml(params.phone);
  const tourName = escapeHtml(params.tourName);
  const date = escapeHtml(params.date);

  return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
        <div style="background:#2d6a4f;padding:28px 24px;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">Nueva solicitud de reserva</h2>
        </div>
        <div style="padding:24px">
          <div style="background:#f4f9f6;border-left:4px solid #2d6a4f;padding:14px;margin:0 0 16px;font-size:14px;color:#444;">
            <strong>Tour:</strong> ${tourName}<br/>
            <strong>Fecha:</strong> ${date}<br/>
            <strong>Cliente:</strong> ${customerName}<br/>
            <strong>Correo:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a><br/>
            <strong>Teléfono:</strong> ${phone}
          </div>
          <p style="color:#666;font-size:13px;margin-top:24px">${escapeHtml(params.senderName)}</p>
        </div>
      </div>
    `;
}

export function getTourReservationAdminText(params: {
  customerName: string;
  customerEmail: string;
  phone: string;
  tourName: string;
  date: string;
  senderName: string;
}): string {
  return `Nueva solicitud de reserva

Tour: ${params.tourName}
Fecha: ${params.date}
Cliente: ${params.customerName}
Correo: ${params.customerEmail}
Teléfono: ${params.phone}

${params.senderName}
`;
}

export function getTestMailHtml(params: {
  recipientName: string;
  senderName: string;
}): string {
  const recipientName = escapeHtml(params.recipientName);
  return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
        <div style="background:#2d6a4f;padding:28px 24px;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">Correo de prueba</h2>
        </div>
        <div style="padding:24px">
          <p style="font-size:15px;line-height:1.6;color:#333">Hola ${recipientName},</p>
          <p style="font-size:15px;line-height:1.6;color:#333">
            Este es un correo de prueba enviado desde el API de Curubande Experience. La integración con Brevo funciona correctamente.
          </p>
          <p style="color:#666;font-size:13px;margin-top:24px">${escapeHtml(params.senderName)}</p>
        </div>
      </div>
    `;
}

export function getTestMailText(params: {
  recipientName: string;
  senderName: string;
}): string {
  return `Hola ${params.recipientName},

Este es un correo de prueba enviado desde el API de Curubande Experience.

${params.senderName}
`;
}
