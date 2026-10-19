// Family testimonials shown on the home page ("Held, when it mattered most").
//
// NOTE: the names on `story: true` items are DUMMY names for illustrative stories. They are
// labelled "A story of care" on the site (never "a family we stood beside"). Replace them with
// real, approved names and quotes before presenting any of this as customer feedback.
// Real family quotes have a name in `n`. Items with `story: true` are illustrative
// stories of care: they are shown WITHOUT a name and labelled as stories, so they
// are never presented as a real family's words. To turn one into a real quote,
// replace the text with the family's actual words, add their name / initials to
// `n` and remove `story`. Set `approved: false` to hide any item.
export interface Testimonial {
  q: string;
  n: string;
  approved: boolean;
  /** Illustrative story of care: shown without a name and labelled as a story, not a quote. */
  story?: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  { q: "When my father passed away late at night, we felt completely helpless. Eternal stepped in with such gentle care — never a transaction, only quiet reverence, standing beside us the whole way.", n: "Arjun Sharma", approved: true },
  { q: "They took care of the hospital paperwork, the transport, the priest — so my mother and I could just sit together in peace. Having someone truly care during our hardest hour made all the difference.", n: "Meera Rastogi", approved: true },
  { q: "In a moment of overwhelming grief, Eternal gave us a calm sanctuary and gentle guidance through every step. We felt genuine warmth exactly when we needed it most.", n: "Dr. V. K. Malhotra", approved: true },
  { q: "We didn't have to ask for anything twice. When we reached the hospital, someone from Eternal was already there. They took care of everything, and we could just be with our family.", n: "Rahul Bansal", approved: true, story: true },
  { q: "My mother's last journey was peaceful. There was a flower on the van and the driver spoke softly. They are small things, but I will never forget them.", n: "Neha Kapoor", approved: true, story: true },
  { q: "We all live in different cities, and that night each of us was alone with our grief. Eternal helped us all reach the same place. We hugged each other and cried together.", n: "Suresh Pillai", approved: true, story: true },
  { q: "I kept saying sorry for troubling them. They said, “You just stay with your family.” And I did.", n: "Anita Deshmukh", approved: true, story: true },
  { q: "At 3 in the night, I called a number I found online. I thought nobody would pick up. A calm voice said, “First tell us what you need.”", n: "Vikram Singh Rathore", approved: true, story: true },
  { q: "We took Dadi's ashes to the river, just as she wanted, with the prayers she loved. For the first time in many days, I felt a little peace.", n: "Pooja Joshi", approved: true, story: true },
];
