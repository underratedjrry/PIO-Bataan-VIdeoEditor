// Validated default palette (see dataviz skill references/palette.md).
// Light/dark pairs, indexed by the skill's fixed categorical slot order.
export const CATEGORICAL = {
  light: [
    "#2a78d6", // 1 blue
    "#eb6834", // 2 orange
    "#1baf7a", // 3 aqua
    "#eda100", // 4 yellow
    "#e87ba4", // 5 magenta
    "#008300", // 6 green
    "#4a3aa7", // 7 violet
    "#e34948", // 8 red
  ],
  dark: [
    "#3987e5",
    "#d95926",
    "#199e70",
    "#c98500",
    "#d55181",
    "#008300",
    "#9085e9",
    "#e66767",
  ],
};

export const SEQUENTIAL_BLUE = { light: "#2a78d6", dark: "#3987e5" };

export const STATUS_COLORS = {
  good: { light: "#0ca30c", dark: "#0ca30c" },
  critical: { light: "#d03b3b", dark: "#d03b3b" },
};

// Re-grounded to the app's slate neutral scale (see globals.css) so charts
// match the surrounding white / dark-gray theme instead of the skill's
// default warm-gray chrome.
export const CHROME = {
  light: {
    surface: "#ffffff",
    primaryInk: "#0f172a",
    secondaryInk: "#475569",
    muted: "#64748b",
    grid: "#e2e8f0",
  },
  dark: {
    surface: "#1e293b",
    primaryInk: "#f8fafc",
    secondaryInk: "#cbd5e1",
    muted: "#94a3b8",
    grid: "#334155",
  },
};
