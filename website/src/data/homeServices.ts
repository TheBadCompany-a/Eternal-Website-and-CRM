// Content for the home page service section: the last-rites journey, the services
// inside each category (with availability), and the Eternal vs conventional comparison.
// Availability comes from src/data/servicesData.ts — anything on the roadmap or
// "coming soon" is tagged 'soon'.

export type ServiceTag = 'live' | 'request' | 'partner' | 'soon';

export const TAG_LABEL: Record<ServiceTag, string> = {
  live: 'Live',
  request: 'On request',
  partner: 'Via partner',
  soon: 'SOON',
};

export interface JourneyStep {
  title: string;
}

// What Eternal Repos actually does, from the first call through the last rites and after.
export const JOURNEY_STEPS: JourneyStep[] = [
  { title: 'First call & guidance' },
  { title: 'Gentle transport' },
  { title: 'Family gathering' },
  { title: 'The sacred last rites' },
  { title: 'Support in the days after' },
];

export interface CompareRow {
  aspect: string;
  conventional: string;
  eternal: string;
  eternalTag?: ServiceTag;
}

// Grounded in the Vision page (Delhi NCR survey: ten operators, eleven service options).
export const COMPARE_ROWS: CompareRow[] = [
  {
    aspect: 'Ceremonial vehicle',
    conventional: 'Any vehicle without proper preparation',
    eternal: 'Clean, dedicated AC vehicle with smooth stretcher lift & fresh clean sheets',
  },
  {
    aspect: 'Answering your call',
    conventional: 'Uncertain response or delayed callbacks',
    eternal: 'A polite, caring team member answers 24×7 to help you immediately',
  },
  {
    aspect: 'Arrival & timing',
    conventional: 'Unclear arrival and long waiting times',
    eternal: 'Sent right away, with a clear arrival time shared with you upfront',
    eternalTag: 'soon',
  },
  {
    aspect: 'Hygiene & dignity',
    conventional: 'No standard sanitisation check',
    eternal: 'Cleaned and sanitised before every visit, with full care for your loved one',
  },
  {
    aspect: 'Sharing details',
    conventional: 'Family has to repeat painful details again and again',
    eternal: 'You share details once; our team remembers and manages everything gently',
  },
  {
    aspect: 'Coordination',
    conventional: 'Family has to run after different vendors for each task',
    eternal: 'One dedicated coordinator takes care of transport, paperwork, and ceremonies',
  },
  {
    aspect: 'After the final rites',
    conventional: 'Support ends at the cremation ground',
    eternal: 'We stay with you to help with death certificate papers, prayer meetings, and Asthi Visarjan',
  },
];
