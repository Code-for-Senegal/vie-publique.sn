import { describe, it, expect } from 'vitest'
import {
  getStatusIcon,
  getStatusBackgroundClass,
  getStatusIconClass,
  getStatusTextClass,
} from '../../../app/composables/usePromesseStatus'

describe('usePromesseStatus', () => {
  describe('getStatusIcon', () => {
    it('devrait retourner l\'icône check-circle pour le statut "tenue"', () => {
      expect(getStatusIcon('tenue')).toBe('i-heroicons-check-circle')
    })

    it('devrait retourner l\'icône x-circle pour le statut "non tenue"', () => {
      expect(getStatusIcon('non tenue')).toBe('i-heroicons-x-circle')
    })

    it('devrait retourner l\'icône arrow-path pour le statut "en cours"', () => {
      expect(getStatusIcon('en cours')).toBe('i-heroicons-arrow-path')
    })

    it('devrait retourner l\'icône question-mark-circle pour le statut "non évaluée"', () => {
      expect(getStatusIcon('non évaluée')).toBe(
        'i-heroicons-question-mark-circle',
      )
    })

    it('devrait retourner l\'icône par défaut pour un statut inconnu', () => {
      expect(getStatusIcon('statut inconnu')).toBe(
        'i-heroicons-question-mark-circle',
      )
    })

    it('devrait gérer les majuscules/minuscules correctement', () => {
      expect(getStatusIcon('TENUE')).toBe('i-heroicons-check-circle')
      expect(getStatusIcon('Tenue')).toBe('i-heroicons-check-circle')
    })
  })

  describe('getStatusBackgroundClass', () => {
    it('devrait retourner bg-green-100 pour "tenue"', () => {
      expect(getStatusBackgroundClass('tenue')).toBe('bg-green-100')
    })

    it('devrait retourner bg-red-100 pour "non tenue"', () => {
      expect(getStatusBackgroundClass('non tenue')).toBe('bg-red-100')
    })

    it('devrait retourner bg-yellow-100 pour "en cours"', () => {
      expect(getStatusBackgroundClass('en cours')).toBe('bg-yellow-100')
    })

    it('devrait retourner bg-gray-100 pour un statut inconnu', () => {
      expect(getStatusBackgroundClass('statut inconnu')).toBe('bg-gray-100')
    })
  })

  describe('getStatusIconClass', () => {
    it('devrait retourner text-green-600 pour "tenue"', () => {
      expect(getStatusIconClass('tenue')).toBe('text-green-600')
    })

    it('devrait retourner text-red-600 pour "non tenue"', () => {
      expect(getStatusIconClass('non tenue')).toBe('text-red-600')
    })

    it('devrait retourner text-yellow-600 pour "en cours"', () => {
      expect(getStatusIconClass('en cours')).toBe('text-yellow-600')
    })

    it('devrait retourner text-gray-600 pour un statut inconnu', () => {
      expect(getStatusIconClass('statut inconnu')).toBe('text-gray-600')
    })
  })

  describe('getStatusTextClass', () => {
    it('devrait retourner text-green-800 pour "tenue"', () => {
      expect(getStatusTextClass('tenue')).toBe('text-green-800')
    })

    it('devrait retourner text-red-800 pour "non tenue"', () => {
      expect(getStatusTextClass('non tenue')).toBe('text-red-800')
    })

    it('devrait retourner text-yellow-800 pour "en cours"', () => {
      expect(getStatusTextClass('en cours')).toBe('text-yellow-800')
    })

    it('devrait retourner text-gray-800 pour un statut inconnu', () => {
      expect(getStatusTextClass('statut inconnu')).toBe('text-gray-800')
    })
  })
})
