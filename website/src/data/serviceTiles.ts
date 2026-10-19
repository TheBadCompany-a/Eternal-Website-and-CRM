// Curated service tiles for the /v2 homepage grid and mega menu.
// img omitted => a branded fallback tile is rendered (see HomeViewV2 / Navbar).
export interface ServiceTile {
  label: string;
  href: string;
  img?: string;
}

import { SHOW_VEHICLE } from '../config/features';

const ALL_TILES: ServiceTile[] = [
  { label: 'Immediate Transport', href: '/services/immediate-relief-transport', img: '/assets/eternal_ceremonial_exterior_1.png' },
  { label: 'The Sanctuary Vehicle', href: '/vehicle', img: '/assets/eternal_luxury_interior_1.png' },
  { label: 'Documentation & Permissions', href: '/services/immediate-relief-transport', img: '/assets/gallery_staff_preparation.png' },
  { label: 'Prayer Hall & Gatherings', href: '/services/serene-gatherings-remembrance', img: '/assets/photos/gallery_ceremony.jpg' },
  { label: 'Pre & Post Funeral Service Coordination', href: '/services/immediate-relief-transport' },
  { label: 'Hospitality & Catering', href: '/services/serene-gatherings-remembrance' },
  { label: 'Funeral Flower Decor', href: '/services/serene-gatherings-remembrance', img: '/assets/eternal_floral_procession.png' },
  { label: 'Ceremonial Wreaths', href: '/services/serene-gatherings-remembrance', img: '/assets/photos/gallery_florals.jpg' },
  { label: 'Grief Support & Keepsakes', href: '/services/empathic-care-keepsakes', img: '/assets/gallery_respectful_service.png' },
  { label: 'Obituary & Tributes', href: '/services/serene-gatherings-remembrance' },
  { label: 'Pre-Planning & Peace of Mind', href: '/services/reassuring-peace-of-mind' },
  { label: 'Packages & Insurance', href: '/services/reassuring-peace-of-mind' },
];

export const SERVICE_TILES: ServiceTile[] = ALL_TILES.filter((t) => SHOW_VEHICLE || t.href !== '/vehicle');
