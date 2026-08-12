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

export const CHROME = {
  light: {
    surface: "#fcfcfb",
    primaryInk: "#0b0b0b",
    secondaryInk: "#52514e",
    muted: "#898781",
    grid: "#e1e0d9",
  },
  dark: {
    surface: "#1a1a19",
    primaryInk: "#ffffff",
    secondaryInk: "#c3c2b7",
    muted: "#898781",
    grid: "#2c2c2a",
  },
};
