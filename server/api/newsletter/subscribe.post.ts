export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);

  if (!email) {
    throw createError({ statusCode: 400, message: 'Email requis' });
  }

  const config = useRuntimeConfig();
  const audienceId = Number(config.brevoListId);
  const headers = {
    'api-key': config.brevoApiKey,
    'Content-Type': 'application/json',
  };
  const baseUrl = config.brevoApiUrl;

  if (!baseUrl || !config.brevoApiKey || !Number.isFinite(audienceId)) {
    throw createError({ statusCode: 500, message: 'Configuration newsletter invalide.' });
  }

  const createResponse = await fetch(`${baseUrl}/contacts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, listIds: [audienceId] }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();

    if (error?.code === 'duplicate_parameter') {
      const getResponse = await fetch(`${baseUrl}/contacts/${encodeURIComponent(email)}`, {
        headers,
      });

      if (!getResponse.ok) {
        throw createError({ statusCode: 500, message: 'Une erreur est survenue.' });
      }

      const contact = await getResponse.json();
      const alreadyInAudience = (contact.listIds ?? []).includes(audienceId);

      if (alreadyInAudience) {
        throw createError({
          statusCode: 409,
          message: 'Cette adresse email est déjà inscrite à notre newsletter.',
        });
      }

      await fetch(`${baseUrl}/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ listIds: [audienceId] }),
      });
    } else {
      throw createError({ statusCode: 500, message: error.message ?? 'Une erreur est survenue.' });
    }
  }

  return { success: true, message: 'Inscription réussie ! Merci de vous être abonné.' };
});