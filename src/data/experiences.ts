/* ------------------------------------------------------------------ */
/* Editorial content blocks for the TĀVA home experience.             */
/* Kept separate from components so copy can be revised in one place. */
/* ------------------------------------------------------------------ */

export interface ExperienceEntry {
  index: string;
  title: string;
  body: string;
  meta: string;
}

export const experienceEntries: ExperienceEntry[] = [
  {
    index: '01',
    title: 'The Ingredient',
    body: 'We start with what is good right now — market vegetables, coastal fish, stone-ground grains — and build combinations that let each one speak clearly.',
    meta: 'SEASONAL · REGIONAL · HANDLED WITH CARE',
  },
  {
    index: '02',
    title: 'The Expression',
    body: 'Familiar flavours are re-read rather than replaced. A childhood curry becomes a slow-roasted plate; a street-side snack arrives with a sharper edge.',
    meta: 'FAMILIAR · CONTEMPORARY · FEARLESS',
  },
  {
    index: '03',
    title: 'The Experience',
    body: 'The room is designed around the table: generous spacing, warm service, and a pace that lets conversation finish before the next plate lands.',
    meta: 'WELCOMING · UNHURRIED · SHARED',
  },
];

export interface StoryChapter {
  index: string;
  title: string;
  body: string;
}

export const storyChapters: StoryChapter[] = [
  {
    index: 'I',
    title: 'Rooted',
    body: 'TĀVA began with a simple observation: the Indian table is already one of the most inventive in the world. Our work is to listen to it closely — the pickles, the tempering, the slow braises — and give it room to speak in a contemporary voice.',
  },
  {
    index: 'II',
    title: 'Reimagined',
    body: 'Nothing is deconstructed for effect. Techniques change because they make a dish clearer, not louder: charring for depth, fermenting for brightness, resting for texture. If it does not taste better, it does not stay.',
  },
  {
    index: 'III',
    title: 'Together',
    body: 'We plate for the middle of the table. Small plates arrive first, mains follow at the pace of the room, and the last course is meant to be argued over. Hospitality, for us, is the space between courses.',
  },
];

export interface PrivateDiningExperience {
  index: string;
  title: string;
  body: string;
  tags: string[];
}

export const privateDiningExperiences: PrivateDiningExperience[] = [
  {
    index: '01',
    title: 'Private Celebrations',
    body: 'Birthdays, anniversaries and the milestones that deserve a room of their own — arranged with the kitchen and the service team in advance.',
    tags: ['BIRTHDAYS', 'ANNIVERSARIES', 'GATHERINGS'],
  },
  {
    index: '02',
    title: 'Intimate Dinners',
    body: 'A thoughtfully arranged menu for smaller groups, paced by the room rather than the clock, with dishes designed to travel the table.',
    tags: ['SMALL GROUPS', 'SET MENU', 'GUIDED SERVICE'],
  },
  {
    index: '03',
    title: 'Corporate Gatherings',
    body: 'A calm, considered setting for professional conversations, team occasions and client dinners that should not feel like a conference room.',
    tags: ['TEAM OCCASIONS', 'CLIENT DINNERS', 'DAY PARTS'],
  },
];

export interface JourneyStep {
  index: string;
  label: string;
  title: string;
  body: string;
}

/** The reservation / ordering journey, explained honestly on the home page. */
export const journeySteps: JourneyStep[] = [
  {
    index: '01',
    label: 'CHOOSE',
    title: 'Browse the menu your way',
    body: 'Search by dish, ingredient, mood or dietary preference and shortlist what looks right.',
  },
  {
    index: '02',
    label: 'CUSTOMISE',
    title: 'Adjust it to your table',
    body: 'Heat levels, sides and finishing touches are configured before anything enters the cart.',
  },
  {
    index: '03',
    label: 'ENQUIRE',
    title: 'Send it to the kitchen',
    body: 'Your selection becomes a formatted WhatsApp enquiry that the restaurant confirms with you.',
  },
];

export interface HeroLabel {
  text: string;
}

export const heroLabels: string[] = [
  'EST. 2026 — DEMONSTRATION BRAND',
  'CONTEMPORARY INDIAN DINING',
  'BENGALURU · SERVICE FROM 18:00',
  'SMALL PLATES · FIRE · BREADS',
];
