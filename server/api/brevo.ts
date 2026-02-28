export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) throw createError({ statusCode: 400, message: 'Email requis' })

  const config = useRuntimeConfig()
  const listId = Number(config.brevoListId)
  const headers = {
    'api-key': config.brevoApiKey,
    'Content-Type': 'application/json',
  }
  const baseUrl = config.brevoApiUrl

  // 1. Tenter de créer le contact et l'ajouter à la liste
  const createResponse = await fetch(`${baseUrl}/contacts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, listIds: [listId] }),
  })

  if (!createResponse.ok) {
    const error = await createResponse.json()

    // Le contact existe déjà dans Brevo (pas forcément dans la liste)
    if (error?.code === 'duplicate_parameter') {
      // Vérifier s'il est déjà dans la liste #listId
      const getResponse = await fetch(`${baseUrl}/contacts/${encodeURIComponent(email)}`, {
        headers,
      })

      if (getResponse.ok) {
        const contact = await getResponse.json()
        const alreadyInList = (contact.listIds ?? []).includes(listId)

        if (alreadyInList) {
          throw createError({
            statusCode: 409,
            message: 'Cette adresse email est déjà inscrite à notre newsletter.',
          })
        }

        // Contact global mais pas encore dans la liste → l'ajouter
        await fetch(`${baseUrl}/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ listIds: [listId] }),
        })
      } else {
        throw createError({ statusCode: 500, message: 'Une erreur est survenue.' })
      }
    } else {
      throw createError({ statusCode: 500, message: error.message ?? 'Une erreur est survenue.' })
    }
  }

  // 2. Envoyer l'email de bienvenue
  await fetch(`${baseUrl}/smtp/email`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sender: { name: 'Vie Publique Sénégal', email: 'contact@vie-publique.sn' },
      to: [{ email }],
      subject: 'Bienvenue sur la newsletter Vie Publique Sénégal',
      htmlContent: getWelcomeEmailHtml(email),
    }),
  }).catch((err) => {
    console.error("Erreur lors de l'envoi de l'email de bienvenue:", err)
  })

  return {
    success: true,
    message: 'Inscription réussie ! Un email de bienvenue vous a été envoyé.',
  }
})

function getWelcomeEmailHtml(email: string): string {
  return `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Bienvenue - Vie Publique Sénégal</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f0f4f8; font-family: 'DM Sans', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .email-wrapper { background-color: #f0f4f8; padding: 40px 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .flag-accent { height: 4px; width: 100%; background: linear-gradient(90deg, #008542 33%, #fdef42 33%, #fdef42 66%, #e31b23 66%); position: absolute; top: 0; left: 0; }
    .header { background: linear-gradient(135deg, #003366 0%, #00509d 100%); padding: 50px 48px 40px; text-align: center; position: relative; }
    .logo-mark { display: inline-block; width: 60px; height: 60px; background: #ffffff; border-radius: 50%; margin-bottom: 20px; line-height: 60px; font-size: 24px; color: #003366; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
    .brand-name { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #ffffff; margin-bottom: 4px; }
    .brand-tagline { font-size: 12px; font-weight: 400; color: rgba(255,255,255,0.8); letter-spacing: 2.5px; text-transform: uppercase; }
    .body-section { padding: 45px 40px; }
    .greeting { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #003366; margin-bottom: 20px; }
    .body-text { font-size: 15px; color: #445566; line-height: 1.8; margin-bottom: 18px; }
    .cta-wrapper { text-align: center; margin: 35px 0; }
    .cta-button { display: inline-block; background-color: #00509d; color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; text-decoration: none; padding: 18px 40px; border-radius: 6px; box-shadow: 0 4px 15px rgba(0, 80, 157, 0.3); }
    .info-card { background: #f8fafc; border-left: 4px solid #003366; padding: 15px 20px; margin-top: 30px; }
    .info-card p { font-size: 13px; color: #64748b; }
    .social-section { background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .social-title { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
    .social-icon { display: inline-block; width: 40px; height: 40px; margin: 0 8px; border-radius: 8px; line-height: 40px; text-decoration: none; }
    .fb { background-color: #1877F2; } .tw { background-color: #000000; } .in { background-color: #0A66C2; } .yt { background-color: #FF0000; }
    .social-icon img { width: 18px; vertical-align: middle; }
    .footer { background-color: #002244; padding: 35px 40px; text-align: center; color: #cbd5e1; }
    .footer p { font-size: 12px; margin-bottom: 8px; }
    .footer a { color: #ffffff; text-decoration: underline; }
    @media only screen and (max-width: 480px) { .body-section { padding: 30px 20px !important; } }
  </style>
</head>
<body>
<div class="email-wrapper">
  <div class="email-container">
    <div class="header">
      <div class="flag-accent"></div>
      <div class="logo-mark">SN</div>
      <div class="brand-name">Vie Publique Sénégal</div>
      <div class="brand-tagline">Information &amp; Citoyenneté</div>
    </div>
    <div class="body-section">
      <h1 class="greeting">Bienvenue dans notre newsletter !</h1>
      <p class="body-text">
        Votre inscription est confirmée. Vous recevrez désormais nos analyses sur les politiques publiques
        et l'actualité institutionnelle du Sénégal : documents officiels, journal officiel, nominations,
        travaux parlementaires et bien plus.
      </p>
      <div class="cta-wrapper">
        <a href="https://www.vie-publique.sn" class="cta-button">Visiter le site</a>
      </div>
      <div class="info-card">
        <p>
          Pour vous désabonner à tout moment, utilisez le lien présent en bas de chacun de nos emails.
        </p>
      </div>
    </div>
    <div class="social-section">
      <p class="social-title">Rejoignez la communauté</p>
      <div>
        <a href="https://www.facebook.com/ViePubliqueSenegal" class="social-icon fb"><img src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" alt="FB"/></a>
        <a href="https://x.com/ViePubliqueSN" class="social-icon tw"><img src="https://img.icons8.com/ios-filled/50/ffffff/twitterx.png" alt="X"/></a>
        <a href="https://www.linkedin.com/company/vie-publique-sn" class="social-icon in"><img src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" alt="IN"/></a>
        <a href="https://www.youtube.com/@ViePubliqueSenegal" class="social-icon yt"><img src="https://img.icons8.com/ios-filled/50/ffffff/youtube-play.png" alt="YT"/></a>
      </div>
    </div>
    <div class="footer">
      <p>Destiné à : <strong>${email}</strong></p>
      <p>© 2026 Vie Publique Sénégal · Dakar</p>
      <p style="margin-top: 15px; font-size: 11px;">
        <a href="https://www.vie-publique.sn/a-propos/confidentialite">Politique de confidentialité</a>
      </p>
    </div>
  </div>
</div>
</body>
</html>`
}
