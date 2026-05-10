function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getContactMessageAdminHtml(params: {
  name: string;
  email: string;
  message: string;
  senderName: string;
}): string {
  const name = escapeHtml(params.name);
  const email = escapeHtml(params.email);
  const message = escapeHtml(params.message).replace(/\n/g, '<br/>');

  return `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">
        <div style="background:#2d6a4f;padding:28px 24px;text-align:center;">
          <h2 style="color:#fff;margin:0;font-size:20px;">Nuevo mensaje de contacto</h2>
        </div>
        <div style="padding:24px">
          <p style="font-size:15px;line-height:1.6;color:#333">Alguien envió un mensaje desde el sitio web.</p>
          <div style="background:#f4f9f6;border-left:4px solid #2d6a4f;padding:14px;margin:20px 0;font-size:14px;color:#444;">
            <strong>Nombre:</strong> ${name}<br/>
            <strong>Correo:</strong> <a href="mailto:${email}">${email}</a><br/><br/>
            <strong>Mensaje:</strong><br/>${message}
          </div>
          <p style="color:#666;font-size:13px;margin-top:24px">${escapeHtml(params.senderName)}</p>
        </div>
      </div>
    `;
}

export function getContactMessageAdminText(params: {
  name: string;
  email: string;
  message: string;
  senderName: string;
}): string {
  return `Nuevo mensaje de contacto

Nombre: ${params.name}
Correo: ${params.email}

Mensaje:
${params.message}

${params.senderName}
`;
}
