// Category tagging for questions. Maps question name -> category.
// Keeping this separate from questions.json so the data file stays lean.

export type Category =
  | "Landmarks"
  | "Art"
  | "Figures"
  | "Events"
  | "Documents";

export const CATEGORIES: Category[] = [
  "Landmarks",
  "Art",
  "Figures",
  "Events",
  "Documents",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Landmarks: "var(--hb-cat-landmarks)",
  Art: "var(--hb-cat-art)",
  Figures: "var(--hb-cat-figures)",
  Events: "var(--hb-cat-events)",
  Documents: "var(--hb-cat-documents)",
};

export const CATEGORY_MAP: Record<string, Category> = {
  // Landmarks
  "Taj Mahal": "Landmarks",
  "Eiffel Tower": "Landmarks",
  "Statue of Liberty": "Landmarks",
  "Great Wall of China": "Landmarks",
  "Stonehenge": "Landmarks",
  "Machu Picchu": "Landmarks",
  "Parthenon": "Landmarks",
  "Colosseum": "Landmarks",
  "Great Pyramid of Giza": "Landmarks",
  // Art
  "Mona Lisa": "Art",
  "The Starry Night": "Art",
  "The Scream": "Art",
  "Guernica": "Art",
  "The Last Supper": "Art",
  "The Creation of Adam": "Art",
  "The Birth of Venus": "Art",
  "The Night Watch": "Art",
  "Girl with a Pearl Earring": "Art",
  "American Gothic": "Art",
  "The Great Wave off Kanagawa": "Art",
  "Las Meninas": "Art",
  "The Garden of Earthly Delights": "Art",
  "Nighthawks": "Art",
  "The Thinker": "Art",
  "Venus de Milo": "Art",
  "David (Michelangelo)": "Art",
  "Pieta (Michelangelo)": "Art",
  "Campbell's Soup Cans": "Art",
  // Figures
  "Napoleon Bonaparte": "Figures",
  "Wright Brothers": "Figures",
  "Albert Einstein": "Figures",
  "Mahatma Gandhi": "Figures",
  "Abraham Lincoln": "Figures",
  "Winston Churchill": "Figures",
  "Julius Caesar": "Figures",
  "Leonardo da Vinci": "Figures",
  "William Shakespeare": "Figures",
  "Thomas Edison": "Figures",
  "Marie Curie": "Figures",
  "Christopher Columbus": "Figures",
  "Cleopatra": "Figures",
  "Martin Luther King Jr.": "Figures",
  // Events
  "Apollo 11 Moon Landing": "Events",
  "Fall of the Berlin Wall": "Events",
  "RMS Titanic": "Events",
  // Documents
  "Declaration of Independence": "Documents",
  "Magna Carta": "Documents",
  "Rosetta Stone": "Documents",
  "Code of Hammurabi": "Documents",
};

export function categoryOf(name: string): Category | null {
  return CATEGORY_MAP[name] ?? null;
}
