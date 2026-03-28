export const locales = ["en", "ko", "ja", "zh", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
