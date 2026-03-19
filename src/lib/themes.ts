export type EraTheme =
  | "default"
  | "taylor-swift"
  | "fearless"
  | "speak-now"
  | "red"
  | "1989"
  | "reputation"
  | "lover"
  | "folklore"
  | "evermore"
  | "midnights"
  | "ttpd"
  | "showgirl";

export interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
  headerBg: string;
}

export type TextureType =
  | "none"
  | "grain"
  | "newspaper"
  | "parchment"
  | "dots";

export interface ThemeDefinition {
  id: EraTheme;
  label: string;
  albumImage?: string;
  colors: ThemeColors;
  headerGradient?: string;
  texture: TextureType;
  fontClass: string; // CSS class name for the font
  emptyStates: {
    loading: string;
    allRanked: string;
    tierEmpty: string;
  };
}

export const ERA_THEMES: ThemeDefinition[] = [
  {
    id: "default",
    label: "Default",
    colors: {
      background: "#ffffff",
      foreground: "#171717",
      accent: "#171717",
      accentForeground: "#ffffff",
      muted: "#f9fafb",
      mutedForeground: "#6b7280",
      border: "#e5e7eb",
      card: "#ffffff",
      headerBg: "rgba(255, 255, 255, 0.8)",
    },
    texture: "none",
    fontClass: "font-sans",
    emptyStates: {
      loading: "Loading your tier list...",
      allRanked: "All songs ranked!",
      tierEmpty: "Click songs below to add them here",
    },
  },
  {
    id: "taylor-swift",
    label: "Debut",
    albumImage: "/albums/taylor-swift.png",
    colors: {
      background: "#f6faf3",
      foreground: "#1a2e12",
      accent: "#2d6a1e",
      accentForeground: "#ffffff",
      muted: "#e8f2e4",
      mutedForeground: "#4a6b40",
      border: "#c5dbbe",
      card: "#f0f7ec",
      headerBg: "rgba(246, 250, 243, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #1DB954, #2d6a1e, #1DB954)",
    texture: "none",
    fontClass: "font-serif",
    emptyStates: {
      loading: "Our song is playing on the radio...",
      allRanked: "You belong with every song!",
      tierEmpty: "A place in this world is waiting",
    },
  },
  {
    id: "fearless",
    label: "Fearless",
    albumImage: "/albums/fearless.png",
    colors: {
      background: "#fdf9f0",
      foreground: "#3d2e0a",
      accent: "#b8860b",
      accentForeground: "#ffffff",
      muted: "#f5edd6",
      mutedForeground: "#8a7340",
      border: "#e0d1a8",
      card: "#faf5e8",
      headerBg: "rgba(253, 249, 240, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #C9A96E, #b8860b, #C9A96E)",
    texture: "none",
    fontClass: "font-display",
    emptyStates: {
      loading: "You were Romeo, I was a scarlet letter...",
      allRanked: "And I don't know why, but with you I'd dance in a storm in my best dress — fearless.",
      tierEmpty: "Jump then fall into this tier",
    },
  },
  {
    id: "speak-now",
    label: "Speak Now",
    albumImage: "/albums/speak-now.png",
    colors: {
      background: "#f8f0fc",
      foreground: "#2e1140",
      accent: "#7b2d8e",
      accentForeground: "#ffffff",
      muted: "#eeddf6",
      mutedForeground: "#6b4580",
      border: "#d4b5e2",
      card: "#f4e8fa",
      headerBg: "rgba(248, 240, 252, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #8B45A6, #7b2d8e, #8B45A6)",
    texture: "none",
    fontClass: "font-display",
    emptyStates: {
      loading: "Enchanted to be loading this...",
      allRanked: "Long live all the magic we made!",
      tierEmpty: "Speak now or forever hold your peace",
    },
  },
  {
    id: "red",
    label: "Red",
    albumImage: "/albums/red.png",
    colors: {
      background: "#fdf2f0",
      foreground: "#3a0e08",
      accent: "#a51c0c",
      accentForeground: "#ffffff",
      muted: "#f6ddd9",
      mutedForeground: "#8a4a42",
      border: "#e0b5ae",
      card: "#faf0ed",
      headerBg: "rgba(253, 242, 240, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #8B0000, #a51c0c, #8B0000)",
    texture: "none",
    fontClass: "font-serif",
    emptyStates: {
      loading: "We're happy, free, confused, and lonely at the same time...",
      allRanked: "Everything was beautiful. Everything will be all right.",
      tierEmpty: "I bet you think about this tier",
    },
  },
  {
    id: "1989",
    label: "1989",
    albumImage: "/albums/1989.png",
    colors: {
      background: "#f0f7fc",
      foreground: "#0c2a3d",
      accent: "#3a8fc2",
      accentForeground: "#ffffff",
      muted: "#dcedf8",
      mutedForeground: "#4a7a99",
      border: "#b3d4eb",
      card: "#eaf4fb",
      headerBg: "rgba(240, 247, 252, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #6CC4E8, #3a8fc2, #6CC4E8)",
    texture: "dots",
    fontClass: "font-modern",
    emptyStates: {
      loading: "Welcome to New York, it's been waiting for you...",
      allRanked: "We never go out of style!",
      tierEmpty: "Got a blank space, baby",
    },
  },
  {
    id: "reputation",
    label: "reputation",
    albumImage: "/albums/reputation.png",
    colors: {
      background: "#121212",
      foreground: "#e8e8e8",
      accent: "#e8e8e8",
      accentForeground: "#121212",
      muted: "#1e1e1e",
      mutedForeground: "#999999",
      border: "#333333",
      card: "#1a1a1a",
      headerBg: "rgba(18, 18, 18, 0.9)",
    },
    headerGradient: "linear-gradient(90deg, #333333, #666666, #333333)",
    texture: "newspaper",
    fontClass: "font-condensed",
    emptyStates: {
      loading: "Look what you made me load...",
      allRanked: "I did something bad — ranked them all.",
      tierEmpty: "Are you ready for it?",
    },
  },
  {
    id: "lover",
    label: "Lover",
    albumImage: "/albums/lover.png",
    colors: {
      background: "#fef0f5",
      foreground: "#3d0f22",
      accent: "#d44d7a",
      accentForeground: "#ffffff",
      muted: "#fce0eb",
      mutedForeground: "#a05578",
      border: "#f0c0d4",
      card: "#fdf0f6",
      headerBg: "rgba(254, 240, 245, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #FFB6C1, #d44d7a, #89CFF0, #d44d7a, #FFB6C1)",
    texture: "none",
    fontClass: "font-rounded",
    emptyStates: {
      loading: "I forgot that you existed...",
      allRanked: "All's well that ends well to end up with you!",
      tierEmpty: "You need to calm down and add songs",
    },
  },
  {
    id: "folklore",
    label: "folklore",
    albumImage: "/albums/folklore.png",
    colors: {
      background: "#f5f5f3",
      foreground: "#2a2a28",
      accent: "#6b6b65",
      accentForeground: "#ffffff",
      muted: "#eaeae6",
      mutedForeground: "#7a7a74",
      border: "#d0d0ca",
      card: "#f0f0ec",
      headerBg: "rgba(245, 245, 243, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #a0a09a, #808080, #a0a09a)",
    texture: "grain",
    fontClass: "font-serif",
    emptyStates: {
      loading: "I knew you'd linger like a tattoo kiss...",
      allRanked: "This is me trying — and finishing.",
      tierEmpty: "It's a cardigan, not yet buttoned up",
    },
  },
  {
    id: "evermore",
    label: "evermore",
    albumImage: "/albums/evermore.png",
    colors: {
      background: "#faf5ef",
      foreground: "#33230e",
      accent: "#a0692e",
      accentForeground: "#ffffff",
      muted: "#f0e5d5",
      mutedForeground: "#8a7050",
      border: "#dbc9ae",
      card: "#f7f0e6",
      headerBg: "rgba(250, 245, 239, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #C67B30, #a0692e, #C67B30)",
    texture: "grain",
    fontClass: "font-serif",
    emptyStates: {
      loading: "Long story short, I'm loading...",
      allRanked: "Happiness is ranking all the songs.",
      tierEmpty: "No body, no crime — just an empty tier",
    },
  },
  {
    id: "midnights",
    label: "Midnights",
    albumImage: "/albums/midnights.png",
    colors: {
      background: "#120e20",
      foreground: "#ddd4f0",
      accent: "#9b59b6",
      accentForeground: "#ffffff",
      muted: "#1e1530",
      mutedForeground: "#a088bb",
      border: "#352a50",
      card: "#181028",
      headerBg: "rgba(18, 14, 32, 0.9)",
    },
    headerGradient: "linear-gradient(90deg, #6a3d8a, #9b59b6, #6a3d8a)",
    texture: "dots",
    fontClass: "font-modern",
    emptyStates: {
      loading: "It's me, hi, I'm the loading screen, it's me...",
      allRanked: "You're on your own, kid — you ranked them all.",
      tierEmpty: "Midnight rain, nothing here yet",
    },
  },
  {
    id: "ttpd",
    label: "TTPD",
    albumImage: "/albums/ttpd.png",
    colors: {
      background: "#f7f4ee",
      foreground: "#3a3428",
      accent: "#6b6050",
      accentForeground: "#f7f4ee",
      muted: "#ede8de",
      mutedForeground: "#8a8070",
      border: "#d5ccba",
      card: "#f2eee6",
      headerBg: "rgba(247, 244, 238, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #d5ccba, #8a8070, #d5ccba)",
    texture: "parchment",
    fontClass: "font-typewriter",
    emptyStates: {
      loading: "I can do it with a broken heart...",
      allRanked: "The manuscript has been completed.",
      tierEmpty: "A blank page in the anthology",
    },
  },
  {
    id: "showgirl",
    label: "Showgirl",
    albumImage: "/albums/tloas.png",
    colors: {
      background: "#f8faf2",
      foreground: "#1a2a10",
      accent: "#d4820a",
      accentForeground: "#ffffff",
      muted: "#e6f0d8",
      mutedForeground: "#2d8a3e",
      border: "#8dc47a",
      card: "#f2f7ea",
      headerBg: "rgba(248, 250, 242, 0.85)",
    },
    headerGradient: "linear-gradient(90deg, #2d8a3e, #d4820a, #2d8a3e)",
    texture: "none",
    fontClass: "font-display",
    emptyStates: {
      loading: "The show is about to begin...",
      allRanked: "That's a wrap on the show!",
      tierEmpty: "The spotlight's waiting",
    },
  },
];

export function getThemeById(id: EraTheme): ThemeDefinition {
  return ERA_THEMES.find((t) => t.id === id) ?? ERA_THEMES[0];
}
