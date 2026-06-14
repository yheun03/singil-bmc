import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Locale } from '~/i18n';

/** 사용자가 고른 모드 (system = 기기 설정 추종) */
export type AppThemeMode = 'system' | 'light' | 'dark';
/** 실제 적용되는 테마 */
export type AppTheme = 'light' | 'dark';

const LOCALE_KEY = 'framework:locale';
const MODE_KEY = 'framework:theme-mode';
// 하위호환: 기존 키도 함께 기록
const THEME_KEY = 'framework:theme';

function systemTheme(): AppTheme {
    if (!import.meta.client) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const usePreferencesStore = defineStore('preferences', () => {
    const locale = ref<Locale>('ko');
    const mode = ref<AppThemeMode>('system');
    const theme = ref<AppTheme>('dark');

    function setLocale(next: Locale) {
        locale.value = next;
        if (import.meta.client) localStorage.setItem(LOCALE_KEY, next);
    }

    function resolve(next: AppThemeMode): AppTheme {
        return next === 'system' ? systemTheme() : next;
    }

    function applyTheme(next: AppTheme) {
        if (!import.meta.client) return;
        document.documentElement.dataset.theme = next;
    }

    /** 모드 지정 (system | light | dark) */
    function setThemeMode(next: AppThemeMode) {
        mode.value = next;
        theme.value = resolve(next);
        applyTheme(theme.value);
        if (import.meta.client) {
            localStorage.setItem(MODE_KEY, next);
            localStorage.setItem(THEME_KEY, theme.value);
        }
    }

    /** system → light → dark → system 순환 */
    function cycleThemeMode() {
        const order: AppThemeMode[] = ['system', 'light', 'dark'];
        const idx = order.indexOf(mode.value);
        setThemeMode(order[(idx + 1) % order.length]);
    }

    /** 라이트 ↔ 다크 토글 (현재 적용된 테마 기준) */
    function toggleTheme() {
        setThemeMode(theme.value === 'dark' ? 'light' : 'dark');
    }

    /** 하위호환: 명시적 light/dark 지정 */
    function setTheme(next: AppTheme) {
        setThemeMode(next);
    }

    function hydrate() {
        if (!import.meta.client) return;

        const savedLocale = localStorage.getItem(LOCALE_KEY);
        if (savedLocale === 'ko' || savedLocale === 'en') locale.value = savedLocale;

        const savedMode = localStorage.getItem(MODE_KEY);
        if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
            mode.value = savedMode;
        }

        theme.value = resolve(mode.value);
        applyTheme(theme.value);

        // system 모드일 때 기기 설정 변화에 실시간 반응
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener?.('change', () => {
            if (mode.value === 'system') {
                theme.value = systemTheme();
                applyTheme(theme.value);
                localStorage.setItem(THEME_KEY, theme.value);
            }
        });
    }

    return {
        locale,
        mode,
        theme,
        setLocale,
        setTheme,
        setThemeMode,
        cycleThemeMode,
        toggleTheme,
        hydrate,
    };
});
