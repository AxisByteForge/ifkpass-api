import { Resend } from 'resend';

import { Config } from '../../lib/config/env/get-env';

const config = new Config();
const resend = new Resend(config.get('RESEND_MAIL_API_KEY'));

export class ResendMailService {
  async send(props: { email: string; verifyCode: string }) {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: props.email,
      subject: 'Confirmação de e-mail - IFK Pass',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Olá!</h2>
          <p>Obrigado por se registrar no <strong>IFK Pass</strong>.</p>
          <p>Para confirmar seu e-mail, use o código abaixo:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; background-color: #f2f2f2; display: inline-block;">
            ${props.verifyCode}
          </div>
          <p>Este código expira em 15 minutos.</p>
          <p>Se você não solicitou este cadastro, pode ignorar este e-mail.</p>
          <br/>
          <p>OSS, equipe IFK Pass 🥋</p>
        </div>
      `,
    });
  }
}
