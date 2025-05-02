// アプリでサポートする言語を定義します
export const locales = ['ja', 'en'] as const;
export type Locale = (typeof locales)[number];