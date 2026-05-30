import { readItem, readItems } from '@directus/sdk';
import type { PublicPersonDetail, PublicPersonAppointment } from '~/types/public-person';

/**
 * API pour récupérer le détail d'une personnalité publique.
 *
 * Logique de résolution :
 * 1. Cherche par public_persons.id (nouvelle URL)
 * 2. Si non trouvé, cherche par legacy_position_id (ancienne URL Google)
 *    et retourne un flag `redirect` avec le nouvel ID
 * 3. Si rien trouvé, retourne 404
 */
export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID invalide',
      });
    }

    const numericId = Number(id);

    try {
      const directus = getCmsClient();

      // Champs personne à récupérer (inclut current_appointment M2O comme fallback)
      const personFields = [
        'id',
        'full_name',
        'slug',
        'sexe',
        'short_bio',
        'long_bio',
        'education',
        'photo',
        'facebook',
        'twitter',
        'instagram',
        'tiktok',
        'linkedin',
        'website',
        'legacy_position_id',
        'current_appointment.id',
        'current_appointment.position_title',
        'current_appointment.position_category',
        'current_appointment.position_category_slug',
        'current_appointment.organization_label',
        'current_appointment.appointment_date',
        'current_appointment.end_date',
        'current_appointment.end_reason',
        'current_appointment.is_current',
        'current_appointment.predecessor_label',
        'current_appointment.source_label',
        'current_appointment.source_link',
      ];

      // --- Cas A : recherche par ID direct ---
      let personData: any = null;
      try {
        personData = await directus.request(
          readItem('public_persons', numericId, {
            fields: personFields,
          }),
        );
      } catch {
        // ID non trouvé, on essaie le fallback
      }

      // Vérifier que la personne est publiée (readItem ne filtre pas par status)
      if (personData && personData.status === 'archived') {
        personData = null;
      }

      // --- Cas B : fallback par legacy_position_id ---
      let isLegacyRedirect = false;
      if (!personData) {
        const legacyResults = await directus
          .request(
            readItems('public_persons', {
              fields: personFields,
              filter: {
                legacy_position_id: { _eq: numericId },
                status: { _eq: 'published' },
              },
              limit: 1,
            }),
          )
          .catch(() => []);

        if (legacyResults.length > 0) {
          personData = legacyResults[0];
          isLegacyRedirect = true;
        }
      }

      // --- Cas C : rien trouvé ---
      if (!personData) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Personnalité non trouvée',
        });
      }

      // Si c'est un legacy redirect, on retourne les infos pour la redirection 301
      if (isLegacyRedirect) {
        const slug = personData.slug || generateSlugFromName(personData.full_name);
        return {
          redirect: true,
          redirectTo: `/personnalites/${personData.id}/${slug}`,
          statusCode: 301,
        };
      }

      // Récupération des nominations de cette personne
      const appointmentsData = await directus
        .request(
          readItems('public_person_appointments', {
            fields: [
              'id',
              'position_title',
              'position_category',
              'position_category_slug',
              'organization_label',
              'appointment_date',
              'end_date',
              'end_reason',
              'is_current',
              'predecessor_label',
              'predecessor.id',
              'predecessor.full_name',
              'predecessor.slug',
              'successor_label',
              'successor.id',
              'successor.full_name',
              'successor.slug',
              'source_label',
              'source_link',
              'source_document.id',
              'source_document.title',
              'notes',
            ],
            filter: {
              person: { _eq: personData.id },
              status: { _eq: 'published' },
            },
            sort: ['-appointment_date'],
          }),
        )
        .catch(() => []);

      // Transformation des nominations
      const appointments: PublicPersonAppointment[] = appointmentsData.map((apt: any) => ({
        id: apt.id,
        position_title: apt.position_title,
        position_category: apt.position_category,
        position_category_slug: apt.position_category_slug || null,
        organization_label: apt.organization_label,
        appointment_date: apt.appointment_date,
        end_date: apt.end_date || null,
        end_reason: apt.end_reason || null,
        is_current: apt.is_current,
        predecessor_label: apt.predecessor_label || null,
        predecessor: apt.predecessor
          ? {
              id: apt.predecessor.id,
              full_name: apt.predecessor.full_name,
              slug: apt.predecessor.slug || generateSlugFromName(apt.predecessor.full_name),
            }
          : null,
        successor_label: apt.successor_label || null,
        successor: apt.successor
          ? {
              id: apt.successor.id,
              full_name: apt.successor.full_name,
              slug: apt.successor.slug || generateSlugFromName(apt.successor.full_name),
            }
          : null,
        source_label: apt.source_label || null,
        source_link: apt.source_link || null,
        source_document: apt.source_document
          ? { id: apt.source_document.id, title: apt.source_document.title }
          : null,
        notes: apt.notes || null,
      }));

      // Détermination du current_appointment :
      // 1. Chercher dans la liste des appointments celui avec is_current === true
      // 2. Sinon, utiliser le M2O current_appointment (peut être obsolète)
      // 3. Sinon, prendre le plus récent
      let currentAppointment: PublicPersonAppointment | null =
        appointments.find((a) => a.is_current) || null;

      // Fallback vers le M2O si aucun is_current trouvé dans la liste
      if (!currentAppointment && personData.current_appointment) {
        const ca = personData.current_appointment;
        const existingInList = appointments.find((a) => a.id === ca.id);
        if (existingInList) {
          currentAppointment = existingInList;
        } else {
          currentAppointment = {
            id: ca.id,
            position_title: ca.position_title,
            position_category: ca.position_category,
            position_category_slug: ca.position_category_slug || null,
            organization_label: ca.organization_label,
            appointment_date: ca.appointment_date,
            end_date: ca.end_date || null,
            end_reason: ca.end_reason || null,
            is_current: ca.is_current,
            predecessor_label: ca.predecessor_label || null,
            predecessor: null,
            successor_label: null,
            successor: null,
            source_label: ca.source_label || null,
            source_link: ca.source_link || null,
            source_document: null,
            notes: null,
          };
          appointments.unshift(currentAppointment);
        }
      }

      // Dernier fallback : le plus récent
      if (!currentAppointment) {
        currentAppointment = appointments[0] || null;
      }

      // Construction de la réponse
      const person: PublicPersonDetail = {
        id: personData.id,
        full_name: personData.full_name,
        slug: personData.slug || generateSlugFromName(personData.full_name),
        sexe: personData.sexe,
        short_bio: personData.short_bio || null,
        long_bio: personData.long_bio || null,
        education: personData.education || null,
        photo: personData.photo || null,
        facebook: personData.facebook || null,
        twitter: personData.twitter || null,
        instagram: personData.instagram || null,
        tiktok: personData.tiktok || null,
        linkedin: personData.linkedin || null,
        website: personData.website || null,
        legacy_position_id: personData.legacy_position_id || null,
        current_appointment: currentAppointment,
        appointments,
      };

      return {
        person,
        redirect: false,
      };
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 404,
        statusMessage: 'Personnalité non trouvée',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 5 min en prod (à augmenter après stabilisation)
    name: 'public-person-detail',
    getKey: (event) => `public-person-${getRouterParam(event, 'id')}`,
  },
);
