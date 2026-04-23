// Era + Wikipedia slug lookup per question name.
// Keeps questions.json clean.

export interface EraInfo {
  year: string;  // display text, e.g. "1889"
  wikipedia: string; // Wikipedia slug
}

export const ERA_MAP: Record<string, EraInfo> = {
  "Taj Mahal": { year: "1632 CE", wikipedia: "Taj_Mahal" },
  "Mona Lisa": { year: "c.1503", wikipedia: "Mona_Lisa" },
  "Declaration of Independence": {
    year: "1776",
    wikipedia: "United_States_Declaration_of_Independence",
  },
  "Napoleon Bonaparte": { year: "1769–1821", wikipedia: "Napoleon" },
  "Wright Brothers": { year: "1903", wikipedia: "Wright_brothers" },
  "Eiffel Tower": { year: "1889", wikipedia: "Eiffel_Tower" },
  "Statue of Liberty": { year: "1886", wikipedia: "Statue_of_Liberty" },
  "Great Wall of China": {
    year: "7th c. BCE",
    wikipedia: "Great_Wall_of_China",
  },
  "Stonehenge": { year: "c.3000 BCE", wikipedia: "Stonehenge" },
  "Machu Picchu": { year: "15th c.", wikipedia: "Machu_Picchu" },
  "Parthenon": { year: "447–432 BCE", wikipedia: "Parthenon" },
  "Colosseum": { year: "80 CE", wikipedia: "Colosseum" },
  "Great Pyramid of Giza": {
    year: "c.2560 BCE",
    wikipedia: "Great_Pyramid_of_Giza",
  },
  "The Starry Night": { year: "1889", wikipedia: "The_Starry_Night" },
  "The Scream": { year: "1893", wikipedia: "The_Scream" },
  "Albert Einstein": { year: "1879–1955", wikipedia: "Albert_Einstein" },
  "Mahatma Gandhi": { year: "1869–1948", wikipedia: "Mahatma_Gandhi" },
  "Abraham Lincoln": { year: "1809–1865", wikipedia: "Abraham_Lincoln" },
  "Winston Churchill": { year: "1874–1965", wikipedia: "Winston_Churchill" },
  "Julius Caesar": { year: "100–44 BCE", wikipedia: "Julius_Caesar" },
  "Leonardo da Vinci": {
    year: "1452–1519",
    wikipedia: "Leonardo_da_Vinci",
  },
  "William Shakespeare": {
    year: "1564–1616",
    wikipedia: "William_Shakespeare",
  },
  "Apollo 11 Moon Landing": { year: "1969", wikipedia: "Apollo_11" },
  "Fall of the Berlin Wall": {
    year: "1989",
    wikipedia: "Fall_of_the_Berlin_Wall",
  },
  "RMS Titanic": { year: "1912", wikipedia: "Titanic" },
  "Magna Carta": { year: "1215", wikipedia: "Magna_Carta" },
  "Thomas Edison": { year: "1847–1931", wikipedia: "Thomas_Edison" },
  "Marie Curie": { year: "1867–1934", wikipedia: "Marie_Curie" },
  "Christopher Columbus": {
    year: "1451–1506",
    wikipedia: "Christopher_Columbus",
  },
  "Cleopatra": { year: "69–30 BCE", wikipedia: "Cleopatra" },
  "Martin Luther King Jr.": {
    year: "1929–1968",
    wikipedia: "Martin_Luther_King_Jr.",
  },
};

export function eraOf(name: string): EraInfo | null {
  return ERA_MAP[name] ?? null;
}

export function wikipediaUrl(name: string): string | null {
  const info = ERA_MAP[name];
  return info ? `https://en.wikipedia.org/wiki/${info.wikipedia}` : null;
}
