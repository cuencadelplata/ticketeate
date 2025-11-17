/**
 * Open Graph Metadata Generator
 * Utilities for generating dynamic Open Graph metadata for social sharing
 */

import type { Event } from '@/types/events';

export interface OGMetadataOptions {
  baseUrl: string;
  eventId: string;
  event: Event;
}

/**
 * Generate Open Graph image URL using Cloudinary dynamic URLs
 * This creates a dynamic OG image with the event image, title, and Ticketeate branding
 */
export function generateOGImageUrl(options: OGMetadataOptions): string {
  const { baseUrl, eventId, event } = options;

  // Get event image
  const eventImage = event.imagenes_evento?.[0]?.url;

  // If you're using a service to generate OG images, use this URL
  // Otherwise, use the event image directly
  if (eventImage) {
    return eventImage;
  }

  // Fallback to default image
  return `${baseUrl}/icon-ticketeate.png`;
}

/**
 * Format event date in a readable way
 */
export function formatEventDateForOG(event: Event): string {
  const eventDate = event.fechas_evento?.[0]?.fecha_hora;

  if (!eventDate) {
    return 'Próximamente';
  }

  return new Date(eventDate).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate event description with sane defaults
 */
export function generateEventDescription(event: Event): string {
  if (event.descripcion) {
    return event.descripcion.substring(0, 160); // Twitter limit
  }

  const date = formatEventDateForOG(event);
  return `Compra entradas para ${event.titulo} en Ticketeate - ${date}`;
}

/**
 * Get event category
 */
export function getEventCategory(event: Event): string {
  return event.evento_categorias?.[0]?.categoriaevento?.nombre || 'Evento';
}

/**
 * Get event location
 */
export function getEventLocation(event: Event): string {
  return event.ubicacion || '';
}

/**
 * Build complete Open Graph keywords
 */
export function buildEventKeywords(event: Event): string[] {
  return [
    getEventCategory(event),
    'evento',
    'entradas',
    'tickets',
    getEventLocation(event),
    event.titulo,
  ].filter(Boolean);
}
