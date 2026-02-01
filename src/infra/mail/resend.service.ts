import { Resend } from 'resend';
import { getConfig } from '@/shared/lib/config/env/get-env';

const getResendClient = (): Resend => {
  const apiKey = getConfig('RESEND_API_KEY');
  return new Resend(apiKey);
};

const VERIFICATION_CODE_TEMPLATE = `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; padding: 24px;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="600" style="background-color: #ffffff; border-radius: 8px; padding: 32px;">
            
            <tr>
              <td style="text-align: center;">
                <h2 style="color: #111827; margin-bottom: 8px;">
                  🥋 IFK Pass
                </h2>
                <p style="color: #6b7280; font-size: 14px;">
                  Código de acesso
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 24px 0; color: #111827; font-size: 16px;">
                <p>Olá!</p>

                <p>
                  Use o código abaixo para acessar o <strong>IFK Pass</strong>:
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <span style="
                    font-size: 32px;
                    letter-spacing: 6px;
                    font-weight: bold;
                    background-color: #f3f4f6;
                    padding: 16px 24px;
                    border-radius: 8px;
                    display: inline-block;
                    color: #111827;
                  ">
                    {{CODE}}
                  </span>
                </div>

                <p style="font-size: 14px; color: #374151;">
                  ⏰ Este código expira em <strong>10 minutos</strong>.
                </p>

                <p style="font-size: 14px; color: #6b7280;">
                  Se você não solicitou este código, pode ignorar este e-mail.
                </p>
              </td>
            </tr>

            <tr>
              <td style="border-top: 1px solid #e5e7eb; padding-top: 16px; font-size: 12px; color: #9ca3af;">
                <p>
                  IFK Pass • Sistema de credenciamento de karatecas
                </p>
                <p>
                  Este é um e-mail automático, não responda.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<string> => {
  const client = getResendClient();
  const fromEmail = getConfig('RESEND_FROM_EMAIL');

  const { data, error } = await client.emails.send({
    from: fromEmail,
    to: [to],
    subject,
    html: htmlContent
  });

  if (error) {
    throw new Error(`Send mail error: ${error.message}`);
  }

  return data?.id || '';
};

export const sendVerificationCode = async (
  to: string,
  code: string
): Promise<string> => {
  const htmlContent = VERIFICATION_CODE_TEMPLATE.replace('{{CODE}}', code);
  return sendEmail(to, 'Seu código de acesso - IFK Pass', htmlContent);
};
