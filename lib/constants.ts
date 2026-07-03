export const ENTERTAINER_TYPES = [
  "Clown",
  "Face Painter",
  "Magician",
  "DJ",
  "Storyteller",
  "Balloon Artist",
  "Puppeteer",
  "Musician",
  "Photo Booth",
  "Circus Performer",
  "Character / Mascot",
  "Other",
] as const;

export const UK_REGIONS = [
  "London",
  "South East",
  "South West",
  "East of England",
  "West Midlands",
  "East Midlands",
  "North West",
  "North East",
  "Yorkshire and the Humber",
  "Wales",
  "Scotland",
  "Northern Ireland",
] as const;

// The 4 accent colours pulled from the Kephi logo, used to tag entertainer
// types so browse cards echo the starburst mark without overusing any one hue.
export const TYPE_ACCENTS = ["tangerine", "teal", "plum", "gold"] as const;

export function accentForType(type: string) {
  const index = ENTERTAINER_TYPES.indexOf(type as (typeof ENTERTAINER_TYPES)[number]);
  const i = index === -1 ? type.length : index;
  return TYPE_ACCENTS[i % TYPE_ACCENTS.length];
}
