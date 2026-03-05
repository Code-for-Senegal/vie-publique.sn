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

      if (!getResponse.ok) {
        throw createError({ statusCode: 500, message: 'Une erreur est survenue.' })
      }

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
      throw createError({ statusCode: 500, message: error.message ?? 'Une erreur est survenue.' })
    }
  }

  return { success: true, message: 'Inscription réussie ! Merci de vous être abonné.' }
})
