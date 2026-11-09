export interface PresetTopic {
  label: string;
  /** Search query sent to the news source (defaults to the label). */
  query?: string;
  emoji: string;
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
      { label: "Coffee", emoji: "☕" },
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

const PRESETS = new Map(
  TOPIC_GROUPS.flatMap((g) => g.topics).map((t) => [t.label.toLowerCase(), t]),
);

export function presetFor(label: string): PresetTopic | undefined {
  return PRESETS.get(label.toLowerCase());
}

export function queryFor(label: string): string {
  return presetFor(label)?.query ?? label;
}

export function emojiFor(label: string): string {
  return presetFor(label)?.emoji ?? "✨";
}
