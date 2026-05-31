import En from './en';
import Ko from './ko';

export type Locale = 'ko' | 'en';
type Dictionary = Record<string, string>;

export const I18N_MESSAGES: Record<Locale, Dictionary> = {
    ko: Ko,
    en: En,
};
