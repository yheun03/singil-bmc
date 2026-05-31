import { storeToRefs } from 'pinia';
import { I18N_MESSAGES } from '~/i18n';
import { usePreferencesStore } from '~/stores/preferences';

export function useI18nText() {
    const preferences = usePreferencesStore();
    const { locale } = storeToRefs(preferences);

    function t(key: string, fallback?: string) {
        return I18N_MESSAGES[locale.value][key] ?? fallback ?? key;
    }

    return {
        locale,
        t,
    };
}
