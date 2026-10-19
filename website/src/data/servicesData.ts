import {
  PhoneCall,
  Zap,
  FileText,
  Building2,
  Sparkles,
  Utensils,
  HeartHandshake,
  Flower2,
  PenTool,
  Heart,
  Globe2,
  FileCheck2,
  ShieldCheck,
  CreditCard,
  CalendarCheck,
  FileCheck,
  Truck,
  LucideIcon,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  Compass,
  Users,
} from 'lucide-react';

// ==========================================
// 1. REUSABLE SERVICE STATUS SYSTEM
// ==========================================
export type ServiceStatus =
  | 'LIVE'
  | 'ON REQUEST'
  | 'VIA PARTNER'
  | 'ON REQUEST · VIA PARTNER'
  | 'REFERRAL SUPPORT'
  | 'ON REQUEST / ROADMAP'
  | 'ROADMAP · REFERRAL'
  | 'COMING SOON';

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  status: ServiceStatus;
  statusLabel?: string;
  tagline?: string;
  description: string;
  inclusions?: string[];
  clarification?: string;
  ctaText: string;
  ctaAction?: 'concierge' | 'call' | 'whatsapp';
  conciergeCategory?: string;
  slug?: string;
  icon?: LucideIcon;
  image?: string;
  subtext?: string;
}

// ==========================================
// 2. CORE SERVICES — LIVE
// Highest visual hierarchy
// ==========================================
export const CORE_LIVE_SERVICES: ServiceItem[] = [
  {
    id: 'transport-documentation-support',
    title: 'Ceremonial Transport & Paperwork Guidance',
    category: 'Immediate Response',
    status: 'LIVE',
    tagline: 'A clean, respectful vehicle and step-by-step help with hospital and cremation papers.',
    description:
      'Safe and respectful transport from hospital or home to the cremation or burial ground. We help with all paperwork and provide an extra car for family members.',
    inclusions: [
      'Clean, air-conditioned vehicle (Vahan)',
      'Extra comfortable car for family members',
      'Polite driver and helpful assistant',
      'Automatic stretcher lift for easy and gentle movement',
      'Full sanitisation and fresh clean sheets',
      'Quick pickup and timely arrival',
      'Step-by-step help with hospital release and death certificate papers',
      'Help with hospital gate passes and paperwork',
      'Support at the cremation or burial ground',
      'Regular, clear updates to your family throughout the journey',
      'Simple, clear receipts with no hidden costs',
    ],
    clarification:
      'Our team guides you through all forms and paperwork. Official death certificates are issued by the hospital or the local municipal office (MCD).',
    ctaText: 'Request Transport Assistance',
    ctaAction: 'concierge',
    conciergeCategory: 'Transport & Documentation Support inclusive of extra transport for family',
    icon: Truck,
    image: '/assets/eternal_ceremonial_exterior_1.png',
  },
  {
    id: 'funeral-service-coordination',
    title: 'Complete Funeral Coordination & Support',
    category: 'Core Live Service',
    status: 'LIVE',
    tagline: 'One dedicated coordinator to take care of all arrangements, so your family does not have to worry.',
    description:
      'Our caring team handles every detail — transport, priests, flowers, and prayer halls — so you do not have to manage multiple people in your time of grief.',
    inclusions: [
      'Dedicated family coordinator available 24/7',
      'Timely vehicle arrival and route planning',
      'Clear guidance on hospital and cremation paperwork',
      'Help arranging flowers, prayer halls, or food on request',
      'Gentle, regular updates to your family at every step',
      'Our team stays with you until all final rites are peacefully finished',
    ],
    clarification:
      'Our coordinator manages every detail with trusted partners, giving you one calm person you can always rely on.',
    ctaText: 'Speak With Our Team',
    ctaAction: 'concierge',
    conciergeCategory: 'Pre & Post Funeral Service Coordination',
    icon: HeartHandshake,
    image: '/assets/gallery_respectful_service.png',
  },
];

// ==========================================
// 3. HOW IT WORKS — 5-STEP JOURNEY
// ==========================================
export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: '01',
    title: 'A simple phone call',
    description: 'Call or WhatsApp us anytime. Just tell us your location and what immediate help you need.',
  },
  {
    step: '02',
    title: 'We guide you gently',
    description: 'We listen patiently, explain the next steps clearly, and help you collect any required papers.',
  },
  {
    step: '03',
    title: 'Our team arrives quickly',
    description: 'A clean vehicle with a polite driver and helper arrives promptly at your location.',
  },
  {
    step: '04',
    title: 'Smooth transport & paperwork',
    description: 'We help with hospital release, gentle transport, and crematorium entry without rushing you.',
  },
  {
    step: '05',
    title: 'We stay beside you',
    description: 'Our team stays with your family until all final rites are peacefully completed.',
  },
];

// ==========================================
// 4. THE ETERNAL JOURNEY — VEHICLE SERVICE STANDARDS
// ==========================================
export interface VehiclePillar {
  number: string;
  title: string;
  summary: string;
  details: string;
  icon: LucideIcon;
  image?: string;
}

export const VEHICLE_SERVICE_PILLARS: VehiclePillar[] = [
  {
    number: '01',
    title: 'Clean Ceremonial Vehicle',
    summary: 'A peaceful, air-conditioned vehicle prepared with complete care.',
    details:
      'Clean interiors, gentle warm lighting, full AC, and fresh white sheets to carry your loved one with utmost care.',
    icon: Car,
    image: '/assets/eternal_ceremonial_exterior_1.png',
  },
  {
    number: '02',
    title: 'Polite & Courteous Staff',
    summary: 'Caring staff who treat your family with deep respect.',
    details:
      'Polite, well-dressed drivers and helpers who assist your family with patience, gentle care, and quiet respect.',
    icon: Users,
    image: '/assets/gallery_staff_preparation.png',
  },
  {
    number: '03',
    title: 'Smooth Stretcher Lift',
    summary: 'Automatic lift for gentle and safe movement.',
    details:
      'An automatic lift mechanism that moves the stretcher smoothly without bumps, jerks, or heavy physical strain.',
    icon: Sparkles,
    image: '/assets/eternal_bier_sanctuary.png',
  },
  {
    number: '04',
    title: 'Thorough Hygiene & Cleanliness',
    summary: 'Deeply cleaned and sanitised before every journey.',
    details:
      'Every vehicle is thoroughly sanitised before each visit, with fresh clean sheets for your family’s complete peace of mind.',
    icon: ShieldCheck,
    image: '/assets/eternal_glass_sanctuary.png',
  },
];

// ==========================================
// 5. MEMORIAL & FLORAL ARRANGEMENTS (ON REQUEST)
// ==========================================
export const MEMORIAL_SERVICES: ServiceItem[] = [
  {
    id: 'prayer-hall-booking',
    title: 'Prayer Hall Booking',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    description:
      'Help finding and booking a quiet prayer hall (Shok Sabha) near your home, suited to your family’s needs and budget.',
    ctaText: 'Enquire About Halls',
    ctaAction: 'concierge',
    conciergeCategory: 'Prayer Hall Booking Enquiry',
    icon: Building2,
    image: '/assets/services/prayer_hall_booking.jpg',
  },
  {
    id: 'hall-decoration',
    title: 'Hall Decoration',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    description:
      'Arranging peaceful hall setup with fresh white flowers, comfortable seating, and photo framing according to your family’s wishes.',
    ctaText: 'Enquire About Decor',
    ctaAction: 'concierge',
    conciergeCategory: 'Hall Decoration Enquiry',
    icon: Sparkles,
    image: '/assets/services/hall_decoration.jpg',
  },
  {
    id: 'catering',
    title: 'Catering',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    description:
      'Arranging simple, clean tea, water, and refreshments for guests attending prayer meetings and gatherings.',
    ctaText: 'Enquire About Catering',
    ctaAction: 'concierge',
    conciergeCategory: 'Catering Enquiry',
    icon: Utensils,
    image: '/assets/services/funeral_catering.jpg',
  },
  {
    id: 'memorial-service',
    title: 'Memorial Service & Memory Mementos',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST / ROADMAP',
    description:
      'Help in arranging a peaceful prayer meeting (Chautha, Tehravin, or Shok Sabha) and simple remembrance tributes.',
    subtext:
      'Digital photo slideshows and remembrance memory cards can also be prepared for your family.',
    ctaText: 'Speak With Us',
    ctaAction: 'concierge',
    conciergeCategory: 'Memorial Service & Memory Mementos',
    icon: HeartHandshake,
    image: '/assets/services/memorial_mementos.jpg',
  },
  {
    id: 'funeral-flower-decor',
    title: 'Funeral Flower Decor',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    description:
      'Fresh white flower garlands and decorations for the vehicle, photo frame, and prayer hall, prepared with gentle care.',
    ctaText: 'Enquire About Flowers',
    ctaAction: 'concierge',
    conciergeCategory: 'Funeral Flower Decor Enquiry',
    icon: Flower2,
    image: '/assets/services/memorial_floral_hall.jpg',
  },
  {
    id: 'obituary-writing',
    title: 'Obituary Writing',
    category: 'Memorial & Floral Services',
    status: 'LIVE',
    statusLabel: 'Live Add-on',
    description:
      'A heartfelt tribute message written from details you share, ready to send on WhatsApp or publish in newspapers.',
    subtext:
      'Written quickly on the same day. Included free with vehicle bookings.',
    ctaText: 'Request Obituary Writing',
    ctaAction: 'concierge',
    conciergeCategory: 'Obituary Writing Assistance',
    icon: PenTool,
    image: '/assets/services/obituary_writing.jpg',
  },
];

// ==========================================
// 6. FAMILY SUPPORT
// ==========================================
export const FAMILY_SUPPORT_SERVICES: ServiceItem[] = [
  {
    id: 'asthi-visarjan',
    title: 'Asthi Visarjan',
    category: 'Family Support',
    status: 'LIVE',
    statusLabel: 'Live Guidance',
    description:
      'Simple step-by-step guidance, comfortable cars, and priest arrangements for Asthi Visarjan at Haridwar, Garh Ganga, or other sacred ghats.',
    subtext:
      'Every family follows their own traditions. We provide comfortable cars, polite drivers, and trusted priests so the rites are completed peacefully.',
    ctaText: 'View Asthi Visarjan Help',
    ctaAction: 'concierge',
    conciergeCategory: 'Asthi Visarjan Guidance',
    icon: Compass,
  },
  {
    id: 'grief-support-referral',
    title: 'Grief Counselling',
    category: 'Family Support',
    status: 'ROADMAP · REFERRAL',
    description:
      'Connecting family members with caring, qualified counsellors for gentle emotional support in the days following the loss.',
    clarification:
      'We connect your family with verified professional counsellors with no extra charges or markups.',
    ctaText: 'Request Gentle Support',
    ctaAction: 'concierge',
    conciergeCategory: 'Grief Counselling Referral',
    icon: Heart,
  },
];

// ==========================================
// 7. SPECIALISED SERVICES
// ==========================================
export const SPECIALISED_SERVICES: ServiceItem[] = [
  {
    id: 'international-repatriation',
    title: 'International Repatriation',
    category: 'Specialised Services',
    status: 'ON REQUEST',
    description:
      'Caring step-by-step help when your loved one needs to be brought home to India from abroad or taken to another country.',
    inclusions: [
      'Coordination with approved embalming centers',
      'Booking airline cargo space and airport clearances',
      'Guidance for embassy, consulate, and police permissions (NOCs)',
      'Coordination with local teams in the destination country',
      'Continuous updates to your family throughout the journey',
    ],
    clarification:
      'Timing depends on embassy approvals, flight schedules, and government rules. We guide you and stay beside you through every step.',
    ctaText: 'Discuss Repatriation Support',
    ctaAction: 'concierge',
    conciergeCategory: 'International Repatriation Enquiry',
    icon: Globe2,
  },
  {
    id: 'intercity-documentation-assistance',
    title: 'End-to-End Documentation Assistance (Intercity/International)',
    category: 'Specialised Services',
    status: 'ON REQUEST',
    description:
      'Help with travel permits, police NOCs, and clearance papers when travelling with a loved one outside Delhi NCR.',
    inclusions: [
      'Travel permits for crossing state borders',
      'Help getting police and hospital clearance papers (NOCs)',
      'Assistance with local government forms',
      'Continuous support during long-distance road journeys',
    ],
    clarification:
      'Any official government fees are paid directly as per actual receipts.',
    ctaText: 'Request Paperwork Help',
    ctaAction: 'concierge',
    conciergeCategory: 'End-to-End Documentation Assistance',
    icon: FileCheck2,
  },
];

// ==========================================
// 8. OPTIONAL ADD-ONS
// ==========================================
export const OPTIONAL_ADDONS: string[] = [
  'Outstation / long-distance travel',
  'Extra car for family members',
  'Fresh flower decoration for the ceremonial vehicle',
  'Extended paperwork and clearance help',
  'Quick dispatch when available',
];

// ==========================================
// 9. PLANNING AHEAD (COMING SOON)
// ==========================================
export const PLANNING_AHEAD_SERVICES = [
  {
    title: 'Subscription / Pre-Booking Plans',
    status: 'COMING SOON',
    description:
      'Thoughtful advance planning so your family does not have to worry about sudden arrangements or expenses in the future.',
  },
  {
    title: 'Pre-Paid Cremation Policy',
    status: 'COMING SOON',
    description:
      'A simple advance plan to record your wishes and make sure everything is taken care of smoothly and respectfully.',
  },
  {
    title: 'Insurance Company Tie-Ups',
    status: 'COMING SOON',
    description:
      'Working with insurance providers to make funeral claims and paperwork quick and hassle-free.',
  },
];

// ==========================================
// 10. SERVICE AREAS
// ==========================================
export const SERVICE_AREAS = [
  {
    name: 'Gurgaon',
    sectors: 'DLF, Golf Course Road, Sohna Road, Cyber City, and nearby areas',
  },
  {
    name: 'South Delhi',
    sectors: 'Greater Kailash, Vasant Kunj, Hauz Khas, Defence Colony, and Central Delhi',
  },
  {
    name: 'Noida',
    sectors: 'Sectors 1–150, Noida Expressway, and Greater Noida',
  },
  {
    name: 'Ghaziabad',
    sectors: 'Indirapuram, Vaishali, Vasundhara, and Raj Nagar Extension',
  },
  {
    name: 'Adjoining NCR',
    sectors: 'Faridabad and neighbouring Delhi NCR areas',
  },
];

// ==========================================
// 11. SERVICE SPECIFIC FAQS
// ==========================================
export interface ServiceFAQ {
  question: string;
  answer: string;
}

export const SERVICES_FAQS: ServiceFAQ[] = [
  {
    question: 'What should I do first if I need immediate assistance?',
    answer:
      'Please call our 24×7 helpline (+91 84486 61338) or message us on WhatsApp right away. Our team will speak with you politely, understand what you need, and immediately guide you on the next steps while sending the ceremonial vehicle.',
  },
  {
    question: 'Can Eternal Repos help with hospital release documentation?',
    answer:
      'Yes. Our team helps your family with hospital paperwork, guiding you through doctor death slips, hospital release forms, and gate passes.',
  },
  {
    question: 'Does Eternal Repos issue death certificates?',
    answer:
      'Official death certificates are issued by the local municipal office (MCD). We help you fill out forms and gather the right papers so the process is easy and smooth.',
  },
  {
    question: 'Can you arrange transport from a hospital or home?',
    answer:
      'Yes. Our clean, air-conditioned vehicle and polite team will arrive at the hospital, nursing home, or residence to safely and respectfully take your loved one to the cremation or burial ground.',
  },
  {
    question: 'Can you help with crematorium or burial-ground formalities?',
    answer:
      'Yes. We help book slots, handle gate entry, and guide you through paperwork at crematoriums and shamshan ghats across Delhi NCR so you do not have to worry about administrative desks.',
  },
  {
    question: 'Are prayer halls, flowers and catering available?',
    answer:
      'Yes. We can help arrange quiet prayer halls, fresh flower decorations, and simple tea and snacks through trusted local partners.',
  },
  {
    question: 'Do you arrange priests or religious rituals?',
    answer:
      'Yes. We can connect you with trusted local pandits or priests so your family traditions and rituals are followed respectfully.',
  },
  {
    question: 'Do you provide grief counselling?',
    answer:
      'Yes. We connect families with caring, qualified professional counsellors whenever emotional support is needed, with no extra fees or markups.',
  },
  {
    question: 'Do you support outstation or intercity cases?',
    answer:
      'Yes. If you need to take your loved one to your hometown outside Delhi NCR, we arrange dedicated vehicles and help get the necessary travel permits and NOCs.',
  },
  {
    question: 'Can you assist with international repatriation?',
    answer:
      'Yes. If your loved one needs to be brought to India from abroad or taken to another country, we coordinate embalming, flight bookings, embassy clearances, and local handling teams.',
  },
  {
    question: 'How quickly can your team arrive?',
    answer:
      'Our team is available 24×7 across Delhi NCR. Depending on your location and road traffic, we dispatch the nearest vehicle immediately and keep you updated on the exact arrival time.',
  },
];

// ==========================================
// 11b. SERVICE VIEW DETAILS REGISTRY
// Powers the "View" modal across all 14 services
// ==========================================
export interface ServiceViewDetail {
  number: number;
  title: string;
  category: string;
  status: string;
  tag?: string;
  scope: string[];
  inclusions: string[];
  exclusions: string[];
  exclusionSummary?: string;
  description?: string;
  clarification?: string;
  link?: string;
}

export const SERVICE_VIEW_DETAILS: Record<string, ServiceViewDetail> = {
  'Transport & Documentation Support': {
    number: 1,
    title: 'Ceremonial Transport & Paperwork Guidance',
    category: 'Immediate Response',
    status: 'LIVE',
    tag: 'Live Service',
    scope: [
      'Provides your family with respectful transportation from hospital or home to the cremation or burial ground in a clean vehicle.',
      'Our team also helps with hospital release forms and crematorium entry papers.',
    ],
    inclusions: [
      'Clean, air-conditioned vehicle with polite driver and helper',
      'Automatic stretcher lift for safe, gentle movement',
      'Guidance on hospital death slips, release forms, and gate passes',
      'Prompt pickup, hospital clearance, crematorium entry, and regular family updates',
    ],
    exclusions: [
      'Puja items (samagri) and priest offerings are arranged separately upon request',
      'This service is for the final journey; emergency medical ambulances for patients are separate',
      'Official death certificates are issued by the local government office (MCD)',
      'Outstation travel outside Delhi NCR is arranged separately upon request',
    ],
    exclusionSummary:
      'Puja items, priest offerings, emergency medical ambulances, and outstation trips are arranged separately upon request.',
  },
  'Funeral Service Coordination': {
    number: 2,
    title: 'Complete Funeral Coordination & Support',
    category: 'Immediate Response',
    status: 'LIVE',
    tag: 'Live Service',
    scope: [
      'Brings together all arrangements through one dedicated family coordinator.',
      'Vehicle timing, paperwork, flowers, and prayer halls are managed smoothly so your family does not have to deal with multiple vendors in grief.',
    ],
    inclusions: [
      'Dedicated family coordinator available 24/7',
      'Coordination of vehicle timing and route planning',
      'Help with required hospital and cremation papers',
      'Arranging flowers, prayer hall, or catering on request',
      'Regular, gentle updates to the family at every step',
    ],
    exclusions: [
      'Food preparation and hall decoration are carried out by verified local partners',
      'Flower arrangements are prepared through trusted local florists',
      'Emotional therapy is provided by certified independent counsellors',
    ],
    exclusionSummary:
      'Catering and flower decor are coordinated by us and delivered through verified local partners.',
  },
  'Pre & Post Funeral Service Coordination': {
    number: 2,
    title: 'Complete Funeral Coordination & Support',
    category: 'Immediate Response',
    status: 'LIVE',
    tag: 'Live Service',
    scope: [
      'Brings together all arrangements through one dedicated family coordinator.',
      'Vehicle timing, paperwork, flowers, and prayer halls are managed smoothly so your family does not have to deal with multiple vendors in grief.',
    ],
    inclusions: [
      'Dedicated family coordinator available 24/7',
      'Coordination of vehicle timing and route planning',
      'Help with required hospital and cremation papers',
      'Arranging flowers, prayer hall, or catering on request',
      'Regular, gentle updates to the family at every step',
    ],
    exclusions: [
      'Food preparation and hall decoration are carried out by verified local partners',
      'Flower arrangements are prepared through trusted local florists',
      'Emotional therapy is provided by certified independent counsellors',
    ],
    exclusionSummary:
      'Catering and flower decor are coordinated by us and delivered through verified local partners.',
  },
  'Prayer Hall Booking': {
    number: 3,
    title: 'Prayer Hall (Shok Sabha) Booking',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    tag: 'Via Partner',
    scope: [
      'Helps your family find and book a peaceful prayer hall or community center for a prayer meeting (Shok Sabha, Chautha, or Tehravin).',
      'We suggest good options near your home based on the number of guests and your budget.',
    ],
    inclusions: [
      'Shortlisting halls close to your family’s home',
      'Matching venues with your preferred guest size and budget',
      'Checking open time slots and booking the venue',
      'Clear communication on hall rules and timings',
    ],
    exclusions: [
      'Eternal Repos handles the booking; halls are owned and run by their respective trusts or venues',
      'Venue rules and cancellation terms are set by the chosen hall',
    ],
    exclusionSummary:
      'Prayer halls are managed by their respective trusts; our team takes care of finding and booking them for you.',
  },
  'Hall Decoration': {
    number: 4,
    title: 'Prayer Hall Decoration',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    tag: 'Via Partner',
    scope: [
      'Arranges gentle, respectful decoration for the prayer hall or gathering according to your family’s wishes.',
      'Includes fresh white flowers, neat seating layouts, portrait table setup, and soft lighting.',
    ],
    inclusions: [
      'Quiet, respectful decor theme based on family preferences',
      'Fresh flower backdrop and framed photo table setup',
      'Clean, comfortable seating for family and visiting guests',
      'Timely setup and cleanup coordinated with partner decorators',
    ],
    exclusions: [
      'Setup is done by verified local decorators under our guidance',
      'Custom special structures require advance notice',
    ],
    exclusionSummary:
      'Decor and flower styling are set up by verified local decorators under our coordination.',
  },
  'Catering': {
    number: 5,
    title: 'Tea & Gathering Catering',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    tag: 'Via Partner',
    scope: [
      'Arranges clean, simple tea, water, and refreshments for guests attending prayer meetings and gatherings.',
      'Menu choices and guest numbers are coordinated with trusted local caterers.',
    ],
    inclusions: [
      'Simple, clean menu options (tea, coffee, biscuits, bottled water, light snacks)',
      'Confirming guest numbers and serving times',
      'Clean serving staff and hygienic setup',
      'Strict respect for your family’s dietary preferences',
    ],
    exclusions: [
      'Food preparation and serving are handled by verified partner caterers',
      'Menu availability depends on booking notice and venue policies',
    ],
    exclusionSummary:
      'Food preparation and serving are handled by verified catering partners under our team’s coordination.',
  },
  'Memorial Service & Memory Mementos': {
    number: 6,
    title: 'Remembrance Gathering & Keepsakes',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST / ROADMAP',
    tag: 'On Request · Roadmap',
    scope: [
      'Helps families organise a peaceful remembrance gathering or celebration of life.',
      'Can include digital photo tributes, custom memory cards, and simple keepsake cards to honour your loved one.',
    ],
    inclusions: [
      'Help planning gathering timings and flow',
      'Creating digital photo slideshows or memory pages upon request',
      'Custom framed photo setup and remembrance memory cards',
    ],
    exclusions: [
      'This service focuses on remembrance and family gatherings; traditional religious rites are arranged separately',
      'Keepsake items depend on what the family requests and what is available',
    ],
    exclusionSummary:
      'Gatherings and photo tributes are coordinated with the family; traditional religious rites are arranged separately.',
    clarification: 'Note: Keepsake cards and photo items are created on request.',
  },
  'Funeral Flower Decor': {
    number: 7,
    title: 'Fresh Flowers & Garland Decoration',
    category: 'Memorial & Floral Services',
    status: 'ON REQUEST · VIA PARTNER',
    tag: 'Via Partner',
    scope: [
      'Arranges fresh flower decorations for the ceremonial vehicle, framed photo, and prayer hall.',
      'Prepared with gentle white flowers (roses, lilies, marigolds, tuberoses) in line with your family traditions.',
    ],
    inclusions: [
      'Fresh flower garlands for the ceremonial vehicle and photo frame',
      'Flower backdrop and entrance arrangements for the prayer hall',
      'Timely delivery coordinated with trusted local florists',
    ],
    exclusions: [
      'Flower arrangements are made and delivered through verified florist partners',
      'Flower varieties depend on seasonal market availability',
    ],
    exclusionSummary:
      'Fresh floral arrangements are prepared and delivered by verified partner florists.',
  },
  'Obituary Writing': {
    number: 8,
    title: 'Obituary & Tribute Writing',
    category: 'Memorial & Floral Services',
    status: 'LIVE',
    tag: 'Live Add-on',
    scope: [
      'Helps write a respectful, heartfelt obituary or tribute message to share on WhatsApp or print in newspapers.',
      'Carefully written using personal memories and details shared by your family.',
    ],
    inclusions: [
      'Writing a warm and respectful short obituary',
      'Ready to send on WhatsApp family groups or submit to newspapers',
      'Quick drafting on the same day',
      'Included free with ceremonial vehicle bookings',
    ],
    exclusions: [
      'Newspaper publishing charges are paid directly to the newspaper at actual cost',
      'Standard service covers message writing; graphic design posters are made on request',
    ],
    exclusionSummary:
      'We write the tribute text for you; newspaper printing costs are paid directly to the newspaper.',
  },
  'Asthi Visarjan': {
    number: 9,
    title: 'Asthi Visarjan Guidance',
    category: 'Family Support',
    status: 'LIVE',
    tag: 'Live Guidance',
    scope: [
      'Provides step-by-step guidance and comfortable travel for families performing sacred Asthi Visarjan rites.',
      'Help with selecting sacred ghats (Haridwar, Garhmukteshwar, Prayagraj), arranging comfortable outstation cars, and coordinating trusted priests.',
    ],
    inclusions: [
      'Clear step-by-step guidance on sacred rituals and timings',
      'Help selecting the right ghat (Haridwar, Garh Ganga, Prayagraj)',
      'Comfortable AC car and polite driver for family travel',
      'Connecting with respected local priests upon request',
    ],
    exclusions: [
      'Priest dakshina and local ghat fees are offered directly by the family',
      'Hotel rooms or overnight stays, if needed, are booked separately',
    ],
    exclusionSummary:
      'Priest dakshina and local ghat fees are offered directly by the family.',
    link: '/asthi-visarjan',
  },
  'Grief Counselling': {
    number: 10,
    title: 'Emotional Support & Counselling',
    category: 'Family Support',
    status: 'ROADMAP · REFERRAL',
    tag: 'Roadmap · Referral',
    scope: [
      'Connects family members with caring, qualified counsellors for gentle emotional support after the loss of a loved one.',
      'Arranged through verified professional counsellors with no extra charges or markups.',
    ],
    inclusions: [
      'Listening to what emotional support your family needs',
      'Connecting you with verified professional grief counsellors',
      'Quick introduction within 24 hours',
      'Free referral with no added charges',
    ],
    exclusions: [
      'Eternal Repos connects you with certified counsellors',
      'Counselling sessions are conducted directly by certified professionals',
    ],
    exclusionSummary:
      'Eternal Repos connects families with verified counsellors; sessions take place directly with qualified professionals.',
  },
  'Subscription / Pre-Booking Plans': {
    number: 10,
    title: 'Pre-Planning',
    category: 'Pre-Planning',
    status: 'COMING SOON',
    tag: 'Coming Soon',
    scope: [
      'A thoughtful future service to help families plan arrangements in advance, deciding what they want and avoiding sudden stress later.',
      'Designed to give your loved ones clarity and complete peace of mind.',
    ],
    inclusions: [
      'Advance planning options currently being designed',
      'Clear service features to be announced',
      'Simple, transparent payment options',
      'Full details shared before public launch',
    ],
    exclusions: [
      'Plan features and terms are under final review',
      'Complete terms will be published upon launch',
    ],
    exclusionSummary:
      'Final plan details and terms are being developed and will be confirmed before public launch.',
    clarification: 'Note: Full plan details will be published ahead of launch.',
  },
  'Pre-Paid Cremation Policy': {
    number: 11,
    title: 'Pre-Paid Ceremonial Care',
    category: 'Pre-Planning',
    status: 'COMING SOON',
    tag: 'Coming Soon',
    scope: [
      'A future prepaid plan to help families budget for cremation, vehicle, and coordination costs in advance.',
      'Ensures your personal wishes are noted and respected.',
    ],
    inclusions: [
      'Plan details currently being finalized',
      'Comprehensive service inclusions to be confirmed',
      'Transparent payment terms',
      'Full benefits announced before launch',
    ],
    exclusions: [
      'Policy details are under development',
      'Full terms will be announced before launch',
    ],
    exclusionSummary:
      'Coverage details and benefits will be shared before official launch.',
    clarification: 'Note: Full terms will be announced before launch.',
  },
  'Insurance Company Tie-Ups': {
    number: 12,
    title: 'Insurance Tie-Ups & Claims Support',
    category: 'Pre-Planning',
    status: 'COMING SOON',
    tag: 'Coming Soon',
    scope: [
      'Future partnerships planned with leading insurance companies.',
      'Aimed at covering farewell costs under insurance and making claim paperwork simple for families.',
    ],
    inclusions: [
      'Packages being designed with partner insurers',
      'Simple paperwork for faster expense claims',
      'Jointly agreed coverage terms',
    ],
    exclusions: [
      'Claim rules depend on the respective insurance company’s policy',
    ],
    exclusionSummary:
      'Policy terms and claims will be managed together with partner insurance companies.',
    clarification: 'Note: Specific benefits depend on partner insurance terms.',
  },
  'International Repatriation': {
    number: 13,
    title: 'International Repatriation Assistance',
    category: 'Specialized Services',
    status: 'ON REQUEST',
    tag: 'On Request',
    scope: [
      'Assists families with caring guidance when a loved one needs to be brought home to India from abroad or taken to another country.',
      'Coordinates certified embalming, airline cargo space, embassy clearances, and local handling teams in both countries.',
    ],
    inclusions: [
      'Coordination with approved embalming centers',
      'Booking airline cargo space and airport clearance',
      'Step-by-step help with embassy, consulate, and police permissions (NOCs)',
      'Coordination with local handling agents in the other country',
    ],
    exclusions: [
      'Consulate and embassy fees are paid at actual cost',
      'Airline cargo airfares are paid separately at actual cost',
      'Customs clearance duties in the destination country are not included',
    ],
    exclusionSummary:
      'Consulate fees, air-cargo freight, and foreign customs charges are paid directly as per actual official receipts.',
  },
  'End-to-End Documentation Assistance — Intercity / International': {
    number: 14,
    title: 'Interstate & Outstation Paperwork Assistance',
    category: 'Specialized Services',
    status: 'ON REQUEST',
    tag: 'On Request',
    scope: [
      'Helps families with the paperwork needed when travelling with a loved one outside Delhi NCR or crossing state borders.',
      'Includes step-by-step help for interstate travel permits, hospital clearance, police NOCs, and local government forms.',
    ],
    inclusions: [
      'Guidance on vehicle travel permits across state lines',
      'Help getting police and hospital clearance papers (NOCs)',
      'Guidance on forms needed by local government offices',
      'Continuous support during long road journeys',
    ],
    exclusions: [
      'Legal court disputes are outside our scope',
      'Official government fees are paid directly at actual cost',
    ],
    exclusionSummary:
      'Official government fees are paid directly as per actual receipts.',
  },
  'End-to-End Documentation Assistance (Intercity/International)': {
    number: 14,
    title: 'Interstate & Outstation Paperwork Assistance',
    category: 'Specialized Services',
    status: 'ON REQUEST',
    tag: 'On Request',
    scope: [
      'Helps families with the paperwork needed when travelling with a loved one outside Delhi NCR or crossing state borders.',
      'Includes step-by-step help for interstate travel permits, hospital clearance, police NOCs, and local government forms.',
    ],
    inclusions: [
      'Guidance on vehicle travel permits across state lines',
      'Help getting police and hospital clearance papers (NOCs)',
      'Guidance on forms needed by local government offices',
      'Continuous support during long road journeys',
    ],
    exclusions: [
      'Legal court disputes are outside our scope',
      'Official government fees are paid directly at actual cost',
    ],
    exclusionSummary:
      'Official government fees are paid directly as per actual receipts.',
  },
};

// ==========================================
// 12. BACKWARD COMPATIBLE SERVICES_DATA
// Keeps sub-pages and Navbar mega-menu operating accurately
// ==========================================
export interface ServiceDetail {
  title: string;
  desc: string;
  feeling: string;
  tag?: string;
  icon: LucideIcon;
  link?: string;
  img?: string;
}

export interface ServiceCategoryData {
  id: string;
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  tagline: string;
  heroBadge: string;
  summary: string;
  img?: string;
  icon: LucideIcon;
  services: ServiceDetail[];
  highlights: string[];
}

export const SERVICES_DATA: ServiceCategoryData[] = [
  {
    id: 'immediate-relief-transport',
    slug: 'immediate-relief-transport',
    path: '/services/immediate-relief-transport',
    title: 'Immediate Assistance & Transport',
    subtitle: '24×7 Available · Delhi NCR',
    tagline: 'Caring, respectful transport and complete paperwork support when you need it most.',
    heroBadge: '24×7 HELPLINE · DELHI NCR',
    summary:
      'Safe and gentle transport from hospital or home to the cremation ground, complete help with all hospital papers, and an accompanying car for family members.',
    img: '/assets/services/transport_support.jpg',
    icon: Truck,
    highlights: [
      'Clean, air-conditioned vehicle for a peaceful journey',
      'Smooth automatic stretcher lift for safe, gentle movement',
      'Help with hospital body release, death slips, and gate passes',
      'Separate comfortable car for family members',
      'Support at the cremation ground with regular family updates',
    ],
    services: [
      {
        title: 'Ceremonial Transport & Paperwork Guidance',
        desc: 'Round-the-clock respectful transport in a clean AC vehicle, with an accompanying family car and complete paperwork help.',
        feeling: 'Feel calm, respected, and fully supported',
        icon: Truck,
        tag: 'Live Service',
        img: '/assets/services/transport_support.jpg',
      },
      {
        title: 'Complete Funeral Coordination & Support',
        desc: 'One dedicated coordinator managing vehicle timing, paperwork, and ceremony arrangements so your family can stay together peacefully.',
        feeling: 'Feel personal care and guidance at every step',
        icon: HeartHandshake,
        tag: 'Live Service',
        img: '/assets/services/funeral_coordination.jpg',
      },
    ],
  },
  {
    id: 'serene-gatherings-remembrance',
    slug: 'serene-gatherings-remembrance',
    path: '/services/serene-gatherings-remembrance',
    title: 'Prayer Hall & Floral Services',
    subtitle: 'Arranged with Trusted Partners',
    tagline: 'Helping your family arrange peaceful prayer halls, beautiful fresh flowers, and simple catering.',
    heroBadge: 'ARRANGED ON REQUEST',
    summary:
      'Arranging quiet prayer halls (Shok Sabha), peaceful flower decorations, simple catering for guests, and heartfelt obituary messages with trusted local partners.',
    img: '/assets/services/prayer_hall_booking.jpg',
    icon: Flower2,
    highlights: [
      'Finding and booking quiet prayer halls near your home',
      'Respectful hall decor, clean seating, and flower arrangements',
      'Simple tea, water, and refreshments arranged for visitors',
      'Heartfelt tribute messages written for family WhatsApp groups and newspapers',
      'Fresh flower garlands and vehicle decoration',
    ],
    services: [
      {
        title: 'Prayer Hall Booking',
        desc: 'Help in finding and booking a quiet prayer hall (Shok Sabha) near your home, according to your preference and budget.',
        feeling: 'Feel a peaceful space arranged easily',
        icon: Building2,
        tag: 'Via Partner',
        img: '/assets/services/prayer_hall_booking.jpg',
      },
      {
        title: 'Hall Decoration',
        desc: 'Respectful hall decor, fresh white flowers, seating, and photo framing arranged to honour your loved one.',
        feeling: 'Feel a gentle, dignified atmosphere',
        icon: Sparkles,
        tag: 'Via Partner',
        img: '/assets/services/hall_decoration.jpg',
      },
      {
        title: 'Catering',
        desc: 'Simple, clean tea, water, and refreshments for guests attending prayer meetings and gatherings.',
        feeling: 'Feel thoughtful hospitality for your guests',
        icon: Utensils,
        tag: 'Via Partner',
        img: '/assets/services/funeral_catering.jpg',
      },
      {
        title: 'Obituary Writing',
        desc: 'A polite and heartfelt tribute message written from details shared by your family, ready for WhatsApp or newspapers.',
        feeling: 'Feel your loved one remembered with warmth',
        icon: PenTool,
        tag: 'Live Add-on',
        img: '/assets/services/obituary_writing.jpg',
      },
      {
        title: 'Memorial Service & Memory Mementos',
        desc: 'Assistance with arranging a peaceful prayer meeting (Chautha, Tehravin, or Shok Sabha) and simple remembrance tributes.',
        feeling: 'Feel cherished memories honoured',
        icon: HeartHandshake,
        tag: 'On Request · Roadmap',
        img: '/assets/services/memorial_mementos.jpg',
      },
      {
        title: 'Funeral Flower Decor',
        desc: 'Fresh white flower garlands and decorations for the vehicle, photo frame, and prayer hall, prepared with gentle care.',
        feeling: 'Feel natural serenity and reverence',
        icon: Flower2,
        tag: 'Via Partner',
        img: '/assets/services/memorial_floral_hall.jpg',
      },
    ],
  },
  {
    id: 'empathic-care-keepsakes',
    slug: 'empathic-care-keepsakes',
    path: '/services/empathic-care-keepsakes',
    title: 'Family Support',
    subtitle: 'Caring for You & Your Family',
    tagline: 'Gentle step-by-step guidance for Asthi Visarjan and caring emotional support for your family.',
    heroBadge: 'RITUAL GUIDANCE & FAMILY SUPPORT',
    summary:
      'Help with Asthi Visarjan travel and rituals across Haridwar, Garh Ganga, and sacred ghats, along with compassionate support.',
    img: '/assets/services/asthi_visarjan.jpg',
    icon: Heart,
    highlights: [
      'Simple, gentle step-by-step guidance on sacred Asthi Visarjan rituals',
      'Comfortable travel arrangements for Haridwar, Garhmukteshwar, Prayagraj and nearby ghats',
      'Connections with trusted local priests upon request',
      'Warm, respectful support available whenever your family needs someone to talk to',
    ],
    services: [
      {
        title: 'Asthi Visarjan',
        desc: 'Gentle step-by-step guidance, comfortable cars, and priest coordination for Asthi Visarjan at Haridwar, Garhmukteshwar, or sacred ghats.',
        feeling: 'Feel quiet reverence and care',
        icon: Compass,
        tag: 'Live Guidance',
        link: '/asthi-visarjan',
        img: '/assets/services/asthi_visarjan.jpg',
      },
      {
        title: 'Grief Counselling',
        desc: 'Connecting family members with caring, qualified counsellors for gentle emotional support after the loss. Free referral, no extra markup.',
        feeling: 'Feel heard and supported with empathy',
        icon: Heart,
        tag: 'Roadmap · Referral',
        img: '/assets/services/grief_counselling.jpg',
      },
    ],
  },
  {
    id: 'reassuring-peace-of-mind',
    slug: 'reassuring-peace-of-mind',
    path: '/services/reassuring-peace-of-mind',
    title: 'Pre-Planning',
    subtitle: 'Peace of Mind for Tomorrow',
    tagline: 'Thoughtful advance planning to make future arrangements simple and stress-free for your loved ones.',
    heroBadge: 'COMING SOON',
    summary:
      'Advance planning options and pre-booking in development to protect your family from sudden stress and confusion.',
    img: '/assets/services/financial_preplanning.jpg',
    icon: ShieldCheck,
    highlights: [
      'Simple advance planning options being developed for families',
      'Pre-paid arrangements designed for clear, fixed expectations',
      'Upcoming insurance collaborations to make documentation easy',
      'Feel free to speak with us to learn more about advance options',
    ],
    services: [
      {
        title: 'Subscription / Pre-Booking Plans',
        desc: 'Thoughtful advance planning to ensure your family does not have to worry about sudden arrangements or expenses in the future.',
        feeling: 'Feel prepared and peaceful',
        icon: CreditCard,
        tag: 'Coming Soon',
        img: '/assets/services/financial_preplanning.jpg',
      },
      {
        title: 'Pre-Paid Cremation Policy',
        desc: 'A simple advance plan to record your wishes and make sure everything is handled smoothly and respectfully.',
        feeling: 'Feel lasting peace of mind',
        icon: FileCheck,
        tag: 'Coming Soon',
        img: '/assets/services/financial_preplanning.jpg',
      },
      {
        title: 'Insurance Company Tie-Ups',
        desc: 'Working with insurance providers to help make funeral claims and paperwork simple and hassle-free.',
        feeling: 'Feel ease with paperwork and claims',
        icon: ShieldCheck,
        tag: 'Coming Soon',
        img: '/assets/services/insurance_tieups.jpg',
      },
    ],
  },
  {
    id: 'specialised-services',
    slug: 'specialised-services',
    path: '/services/specialised-services',
    title: 'Special Assistance',
    subtitle: 'Interstate Travel & Long Distance',
    tagline: 'Caring coordination for outstation journeys, interstate permits, and international repatriation.',
    heroBadge: 'OUTSTATION & INTERNATIONAL',
    summary:
      'Assistance with taking your loved one to hometowns outside Delhi NCR, interstate transit permits, and international repatriation.',
    img: '/assets/services/international_repatriation.jpg',
    icon: Globe2,
    highlights: [
      'International repatriation with air cargo booking and embassy clearances',
      'Interstate travel permits, hospital NOCs, and police clearances',
      'Long-distance journeys in dedicated, clean, air-conditioned vehicles',
      'Continuous polite communication and guidance throughout the journey',
    ],
    services: [
      {
        title: 'International Repatriation',
        desc: 'Caring step-by-step help when your loved one needs to be brought home from abroad or taken to another country.',
        feeling: 'Feel guided through every international step',
        icon: Globe2,
        tag: 'On Request',
        img: '/assets/services/international_repatriation.jpg',
      },
      {
        title: 'End-to-End Documentation Assistance (Intercity/International)',
        desc: 'Help with outstation travel permissions, interstate NOCs, and clearance paperwork when travelling outside Delhi NCR.',
        feeling: 'Feel relieved of complicated paperwork',
        icon: FileCheck2,
        tag: 'On Request',
        img: '/assets/services/documentation_assistance.jpg',
      },
    ],
  },
];

// ==========================================
// 13. TRANSPARENT FAREWELL PACKAGES (VIP, MEDIUM, VEHICLE)
// ==========================================
export interface PackageFeature {
  name: string;
  price?: number;
  isIncluded?: boolean;
}

export interface FarewellPackage {
  id: string;
  name: string;
  tagline: string;
  totalPrice: number;
  highlighted?: boolean;
  features: PackageFeature[];
}

export const FAREWELL_PACKAGES: FarewellPackage[] = [
  {
    id: 'vehicle',
    name: 'Essential Farewell',
    tagline: 'Respectful ceremonial transportation with fresh decor, memory token, and essential comforts.',
    totalPrice: 11564,
    features: [
      { name: 'Basic decor', price: 10000 },
      { name: 'Fuel car (8.8km)', price: 264 },
      { name: 'Small memory token', price: 800 },
      { name: 'Drinking water', price: 500 },
    ],
  },
  {
    id: 'medium',
    name: 'Complete Farewell',
    tagline: 'Complete ceremonial coordination with priest, sacred samagri, cremation fuel, and medium decor.',
    totalPrice: 46300,
    highlighted: true,
    features: [
      { name: 'Medium decor', price: 22000 },
      { name: 'Fuel on ground (cremation fuel / wood)', price: 9000 },
      { name: 'Pandit ji (Priest for rites)', price: 5600 },
      { name: 'Complete sacred samagri', price: 6000 },
      { name: 'Fuel car (80km)', price: 2400 },
      { name: 'Small memory token', price: 800 },
      { name: 'Drinking water', price: 500 },
    ],
  },
  {
    id: 'vip',
    name: 'Signature Farewell',
    tagline: 'Grand high-end decor, 5 escort vehicles, hi-tea for guests, priest, samagri, and priority VIP coordination.',
    totalPrice: 69800,
    features: [
      { name: 'High-end decor', price: 30000 },
      { name: '5 tailgating escort vehicles', price: 12500 },
      { name: 'Fuel on ground (cremation fuel / wood)', price: 9000 },
      { name: 'Pandit ji (Priest for rites)', price: 5600 },
      { name: 'Complete sacred samagri', price: 6000 },
      { name: 'Hi-tea (up to 50 people)', price: 3000 },
      { name: 'Fuel car (80km)', price: 2400 },
      { name: 'Small memory token', price: 800 },
      { name: 'Drinking water', price: 500 },
    ],
  },
];
