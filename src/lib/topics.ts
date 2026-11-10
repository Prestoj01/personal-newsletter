export interface PresetTopic {
  label: string;
  /** Search query sent to the news source (defaults to the label). */
  query?: string;
  emoji: string;
  /** Other names people type for this topic (matched case-insensitively). */
  aliases?: string[];
}

export interface TopicGroup {
  name: string;
  topics: PresetTopic[];
}

export const TOPIC_GROUPS: TopicGroup[] = [
  {
    name: "Tech & Science",
    topics: [
      { label: "Artificial Intelligence", emoji: "🤖" },
      { label: "Startups", query: "startup funding", emoji: "🚀" },
      { label: "Cybersecurity", emoji: "🔐" },
      { label: "Space Exploration", query: "space exploration NASA SpaceX", emoji: "🪐" },
      { label: "Climate & Energy", query: "climate energy", emoji: "🌍" },
      { label: "Gadgets", query: "gadgets consumer tech", emoji: "📱" },
      { label: "Programming", query: "software development programming", emoji: "💻" },
      { label: "Electric Vehicles", emoji: "🔋" },
    ],
  },
  {
    name: "Sports",
    topics: [
      { label: "NFL", emoji: "🏈" },
      { label: "NBA", emoji: "🏀" },
      { label: "MLB", emoji: "⚾" },
      { label: "Soccer", emoji: "⚽" },
      { label: "Formula 1", emoji: "🏎️" },
      { label: "College Football", emoji: "🎓" },
      { label: "Golf", query: "PGA golf", emoji: "⛳" },
      { label: "Tennis", emoji: "🎾" },
    ],
  },
  {
    name: "Arts & Entertainment",
    topics: [
      { label: "Movies", query: "movies box office", emoji: "🎬" },
      { label: "TV Shows", query: "TV series streaming", emoji: "📺" },
      { label: "Music", query: "music new releases", emoji: "🎵" },
      { label: "Books", query: "books authors publishing", emoji: "📚" },
      { label: "Video Games", emoji: "🎮" },
      { label: "Anime", emoji: "🍥" },
      { label: "Photography", emoji: "📷" },
      { label: "Fashion", emoji: "👗" },
    ],
  },
  {
    name: "Hobbies & Lifestyle",
    topics: [
      { label: "Cooking", query: "cooking recipes food", emoji: "🍳" },
      { label: "Travel", emoji: "✈️" },
      { label: "Fitness", emoji: "🏋️" },
      { label: "Gardening", emoji: "🌱" },
      { label: "Hiking & Outdoors", query: "hiking outdoors national parks", emoji: "🥾" },
      { label: "Coffee", query: "coffee roasters OR espresso OR \"coffee beans\"", emoji: "☕" },
      { label: "Woodworking & DIY", query: "woodworking DIY", emoji: "🪚" },
      { label: "Board Games", query: "board games tabletop", emoji: "🎲" },
    ],
  },
  {
    name: "Money & World",
    topics: [
      { label: "Stock Market", emoji: "📈" },
      { label: "Personal Finance", emoji: "💰" },
      { label: "Cryptocurrency", emoji: "🪙" },
      { label: "Real Estate", query: "real estate housing market", emoji: "🏠" },
      { label: "US Politics", emoji: "🏛️" },
      { label: "World News", emoji: "🌐" },
      { label: "Health & Medicine", query: "health medicine research", emoji: "🩺" },
    ],
  },
];

/**
 * Extra topics that aren't shown as chips but are fetched like presets, so typing them in the
 * "Something else?" box (with autocomplete) gets real, dedicated coverage.
 */
const t = (label: string, emoji: string, query?: string, aliases?: string[]): PresetTopic => ({ label, emoji, query, aliases });

export const CATALOG: PresetTopic[] = [
  // Companies & products
  t("Apple", "🍎", "Apple iPhone Mac"), t("Tesla", "🚗"), t("Nvidia", "🟩"), t("Microsoft", "🪟"), t("Google", "🔎", "Google Alphabet", ["Alphabet"]),
  t("Amazon", "📦"), t("Meta", "👓", "Meta Facebook Instagram", ["Facebook", "Instagram"]), t("OpenAI", "🧠", "OpenAI ChatGPT", ["ChatGPT"]),
  t("Anthropic", "🧠", "Anthropic Claude", ["Claude AI"]), t("Netflix", "🍿"), t("Disney", "🏰"), t("Nintendo", "🍄"), t("PlayStation", "🎮", "PlayStation Sony", ["PS5"]),
  t("Xbox", "🎮"), t("SpaceX", "🚀"), t("Boeing", "🛫"), t("Samsung", "📱"), t("Starbucks", "☕"),
  // People
  t("Taylor Swift", "🎤"), t("Beyoncé", "🎤", "Beyonce", ["Beyonce"]), t("Elon Musk", "🧑‍🚀"), t("LeBron James", "🏀", undefined, ["LeBron"]),
  t("Patrick Mahomes", "🏈", undefined, ["Mahomes"]), t("Caitlin Clark", "🏀"), t("Shohei Ohtani", "⚾", undefined, ["Ohtani"]), t("Lionel Messi", "⚽", undefined, ["Messi"]),
  t("Cristiano Ronaldo", "⚽", undefined, ["Ronaldo"]), t("Simone Biles", "🤸"),
  // Teams
  t("Kansas City Chiefs", "🏈", undefined, ["Chiefs", "KC Chiefs"]), t("Dallas Cowboys", "🏈", undefined, ["Cowboys"]), t("Philadelphia Eagles", "🏈", undefined, ["Eagles"]),
  t("San Francisco 49ers", "🏈", undefined, ["49ers", "Niners"]), t("Green Bay Packers", "🏈", undefined, ["Packers"]), t("Detroit Lions", "🏈"), t("Buffalo Bills", "🏈"),
  t("Los Angeles Lakers", "🏀", undefined, ["Lakers"]), t("Golden State Warriors", "🏀", undefined, ["Warriors"]), t("Boston Celtics", "🏀", undefined, ["Celtics"]),
  t("New York Knicks", "🏀", undefined, ["Knicks"]), t("New York Yankees", "⚾", undefined, ["Yankees"]), t("Los Angeles Dodgers", "⚾", undefined, ["Dodgers"]),
  t("Chicago Cubs", "⚾", undefined, ["Cubs"]), t("Boston Red Sox", "⚾", undefined, ["Red Sox"]), t("Real Madrid", "⚽"), t("FC Barcelona", "⚽", undefined, ["Barcelona", "Barca"]),
  t("Manchester United", "⚽", undefined, ["Man United", "Man Utd"]), t("Liverpool FC", "⚽", undefined, ["Liverpool"]), t("Arsenal", "⚽"),
  // Leagues & sports
  t("NHL", "🏒", undefined, ["Hockey"]), t("WNBA", "🏀"), t("UFC", "🥊", "UFC MMA", ["MMA"]), t("Boxing", "🥊"), t("NASCAR", "🏁"), t("Premier League", "⚽", undefined, ["EPL"]),
  t("Champions League", "🏆"), t("MLS", "⚽"), t("College Basketball", "🏀", "college basketball NCAA", ["March Madness"]), t("Olympics", "🏅"), t("Cycling", "🚴"),
  t("Running", "🏃", "running marathon"), t("Pickleball", "🏓"), t("Esports", "🕹️"), t("Chess", "♟️"), t("Fishing", "🎣"), t("Hunting", "🦌"), t("Surfing", "🏄"),
  t("Skiing", "⛷️", "skiing snowboarding", ["Snowboarding"]), t("Climbing", "🧗", "rock climbing"),
  // Entertainment & franchises
  t("Marvel", "🦸", "Marvel MCU"), t("Star Wars", "⭐"), t("Pokémon", "⚡", "Pokemon", ["Pokemon"]), t("Minecraft", "⛏️"), t("Fortnite", "🎯"), t("Lego", "🧱"),
  t("Broadway", "🎭"), t("K-pop", "🎶", "K-pop", ["Kpop"]), t("Hip Hop", "🎧", "hip hop rap", ["Rap"]), t("Country Music", "🤠"), t("Podcasts", "🎙️"),
  t("Comics", "💥", "comic books"), t("Stand-up Comedy", "😂", "stand-up comedy comedian", ["Comedy"]), t("Reality TV", "📺"), t("Star Trek", "🖖"),
  t("Harry Potter", "⚡"), t("Oscars", "🏆", "Oscars Academy Awards", ["Academy Awards"]),
  // Hobbies & interests
  t("Baking", "🥐"), t("BBQ", "🍖", "barbecue BBQ", ["Barbecue"]), t("Wine", "🍷"), t("Craft Beer", "🍺"), t("Knitting", "🧶", "knitting crochet", ["Crochet"]),
  t("Camping", "🏕️"), t("Birdwatching", "🐦", "birdwatching birding birds", ["Birding"]), t("Astronomy", "🔭"), t("3D Printing", "🖨️"), t("Smart Home", "🏡"),
  t("Dogs", "🐕"), t("Cats", "🐈"), t("Cars", "🚙", "cars automotive"), t("Motorcycles", "🏍️"), t("Aviation", "✈️"), t("Sneakers", "👟"),
  t("Watches", "⌚", "watches horology"), t("Skincare", "🧴", "skincare beauty", ["Beauty"]), t("Interior Design", "🛋️"), t("Architecture", "🏛️"),
  t("Art", "🎨", "art museums artists"), t("History", "📜", "history archaeology", ["Archaeology"]), t("Dinosaurs", "🦖", "dinosaurs paleontology"),
  t("Ocean", "🌊", "ocean marine life"), t("Wildlife", "🐘", "wildlife conservation"), t("Mental Health", "🧘"), t("Nutrition", "🥗"), t("Parenting", "👶"),
  t("Education", "🏫"), t("Jobs & Careers", "💼", "jobs careers workplace", ["Careers"]), t("Small Business", "🏪"), t("Economy", "📊", "economy inflation"),
  t("Supreme Court", "⚖️"), t("Elections", "🗳️"), t("Immigration", "🛂"), t("Weather", "⛅", "weather storms"), t("Quantum Computing", "⚛️"),
  t("Robotics", "🦾"), t("Biotech", "🧬"), t("Nuclear Energy", "☢️"), t("Solar Energy", "☀️"), t("Space Telescopes", "🔭", "James Webb telescope"),
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const KNOWN = new Map<string, PresetTopic>();
for (const topic of [...TOPIC_GROUPS.flatMap((g) => g.topics), ...CATALOG]) {
  for (const name of [topic.label, ...(topic.aliases ?? [])]) KNOWN.set(norm(name), topic);
}

/** Every topic the news job fetches (presets + catalog). */
export const ALL_TOPICS: PresetTopic[] = [...TOPIC_GROUPS.flatMap((g) => g.topics), ...CATALOG];

/** A preset or catalog topic by label or alias. Custom free text returns undefined. */
export function presetFor(label: string): PresetTopic | undefined {
  return KNOWN.get(norm(label));
}

export function queryFor(label: string): string {
  const p = presetFor(label);
  return p ? (p.query ?? p.label) : label;
}

export function emojiFor(label: string): string {
  return presetFor(label)?.emoji ?? "✨";
}

/** File-name-safe id for a known topic's data file. */
export function topicSlug(label: string): string {
  return norm(label).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const isChipTopic = (label: string) => TOPIC_GROUPS.some((g) => g.topics.some((t) => norm(t.label) === norm(label)));
