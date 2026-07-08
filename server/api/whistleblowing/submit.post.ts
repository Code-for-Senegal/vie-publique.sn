import type { WhistleblowingSubmitRequest, WhistleblowingSubmitResponse } from '~~/types/corruption';

export default defineEventHandler(async (event) => {
  const body = await readBody<WhistleblowingSubmitRequest>(event);

  // Validation
  if (!body.subjectId || typeof body.subjectId !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Le sujet est obligatoire.',
    });
  }

  if (!body.description || typeof body.description !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'La description est obligatoire.',
    });
  }

  const descLength = body.description.trim().length;
  if (descLength < 10) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La description doit contenir au moins 10 caractères.',
    });
  }

  if (descLength > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La description ne doit pas dépasser 1000 caractères.',
    });
  }

  if (body.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: "L'adresse e-mail n'est pas valide.",
    });
  }

  // V1 mock — générer un ticketId aléatoire, pas de persistance
  const ticketId = `VP-${String(Math.floor(1000 + Math.random() * 9000))}`;

  const response: WhistleblowingSubmitResponse = {
    success: true,
    ticketId,
    message:
      'Votre signalement a été enregistré (simulation V1). En production, il sera transmis aux autorités compétentes.',
    createdAt: new Date().toISOString(),
  };

  return response;
});
