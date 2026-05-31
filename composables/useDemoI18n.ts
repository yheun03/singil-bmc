import { computed } from 'vue';
import { useI18nText } from '~/composables/useI18nText';

export function useDemoI18n(key: string) {
    const { t } = useI18nText();

    const title = computed(() => t(`demo.${key}.title`));
    const description = computed(() => t(`demo.${key}.desc`));

    return {
        title,
        description,
    };
}
