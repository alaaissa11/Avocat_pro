const nodemailer = require('nodemailer');
const env = require('../config/env');

const isConfigured = () => !!(env.email.host && env.email.user && env.email.pass);

const buildTransport = () => {
  return nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
      user: env.email.user,
      pass: env.email.pass
    }
  });
};

const sendMail = async ({ to, subject, html }) => {
  try {
    if (!isConfigured()) {
      console.log('\n[Email] SMTP non configuré — email envoyé à la console (fallback)');
      console.log('[Email] → To:', to);
      console.log('[Email] → Subject:', subject);
      console.log('[Email] → Content:', html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
      console.log('[Email] Configurez EMAIL_HOST / EMAIL_USER / EMAIL_PASS dans backend/.env pour activer l\'envoi réel.\n');
      return { simulated: true };
    }

    const transporter = buildTransport();
    const info = await transporter.sendMail({
      from: env.email.from,
      to,
      subject,
      html
    });
    console.log('[Email] Email envoyé:', info.messageId);
    return info;
  } catch (err) {
    console.error('[Email] Erreur d\'envoi:', err.message);
    throw err;
  }
};

const resetEmailTemplate = (resetUrl, userPrenom) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); padding: 28px 32px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-family: Georgia, serif;">AVOCAT<span style="color: #c6a052;">PRO</span></h1>
      <p style="color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px;">Réinitialisation de mot de passe</p>
    </div>
    <div style="padding: 32px; background: #ffffff;">
      <p style="color: #1e293b; font-size: 15px; line-height: 1.6; margin: 0 0 12px;">Bonjour ${userPrenom || 'cher utilisateur'},</p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
        Nous avons reçu une demande de réinitialisation de votre mot de passe AVOCAT-PRO.
        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable <strong>1 heure</strong>.
      </p>
      <div style="text-align: center; margin: 0 0 24px;">
        <a href="${resetUrl}"
           style="display: inline-block; background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 14px;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
        Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email — votre mot de passe restera inchangé.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        © ${new Date().getFullYear()} Cabinet Boussayene Knani — Excellence Juridique &amp; Innovation
      </p>
    </div>
  </div>
`;

const sendPasswordResetEmail = async (to, token, userPrenom) => {
  const resetUrl = `${env.email.frontendUrl}/reset-password/${token}`;
  return sendMail({
    to,
    subject: 'Réinitialisation de votre mot de passe — AVOCAT-PRO',
    html: resetEmailTemplate(resetUrl, userPrenom)
  });
};

module.exports = { sendMail, sendPasswordResetEmail, isConfigured };
