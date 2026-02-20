import type { CSSProperties } from "react";

export const ORGANIZER_COLOR_OPTIONS = [
  { label: "AKH zlatá", hex: "#ffd166" },
  { label: "Nebeská", hex: "#7dd3fc" },
  { label: "Jantarová", hex: "#fbbf24" },
  { label: "Smaragdová", hex: "#34d399" },
  { label: "Růžová", hex: "#fb7185" },
  { label: "Fialová", hex: "#a78bfa" },
  { label: "Břidlicová", hex: "#94a3b8" },
  { label: "Korálová", hex: "#fb923c" },
  { label: "Teal", hex: "#2dd4bf" },
  { label: "Malinová", hex: "#f43f5e" },
  { label: "Levandule", hex: "#c4b5fd" },
  { label: "Oliva", hex: "#a3b18a" },
] as const;

export const DEFAULT_AKH_ORGANIZER_COLOR_HEX = "#ffd166";
export const DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX = "#7dd3fc";
export const AKH_ORGANIZER_SETTINGS_ID = "events.akh-organizer";

export type OrganizerColorHex = (typeof ORGANIZER_COLOR_OPTIONS)[number]["hex"];

const ALLOWED_ORGANIZER_COLORS = new Set<string>([
  ...ORGANIZER_COLOR_OPTIONS.map((option) => option.hex),
]);

export function isOrganizerColorHex(value: string): value is OrganizerColorHex {
  return ALLOWED_ORGANIZER_COLORS.has(value);
}

function getReadableTextColor(hex: string) {
  const cleaned = hex.replace("#", "");
  const normalized = cleaned.length === 3
    ? cleaned.split("").map((c) => c + c).join("")
    : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "#111827";
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#0b0b0b" : "#ffffff";
}

export function resolveAkhOrganizerColor(content: unknown): OrganizerColorHex {
  if (
    content &&
    typeof content === "object" &&
    "colorHex" in content &&
    typeof (content as { colorHex?: unknown }).colorHex === "string" &&
    isOrganizerColorHex((content as { colorHex: string }).colorHex)
  ) {
    return (content as { colorHex: OrganizerColorHex }).colorHex;
  }
  return DEFAULT_AKH_ORGANIZER_COLOR_HEX;
}

export function getOrganizerTagPresentation(
  colorHex?: string | null,
  isAkh = false,
  akhColorHex?: string | null,
): { className: string; style: CSSProperties } {
  const selectedHex = isAkh
    ? (akhColorHex && isOrganizerColorHex(akhColorHex) ? akhColorHex : DEFAULT_AKH_ORGANIZER_COLOR_HEX)
    : (colorHex && isOrganizerColorHex(colorHex) ? colorHex : DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX);

  return {
    className: "border font-semibold",
    style: {
      backgroundColor: selectedHex,
      borderColor: selectedHex,
      color: getReadableTextColor(selectedHex),
    },
  };
}
