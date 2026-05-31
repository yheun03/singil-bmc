<template>
    <div class="page-demo">
        <main class="page-demo-main">
            <header class="page-demo__header">
                <h1 class="page-demo__title">{{ t('settings.title') }}</h1>
                <p class="page-demo__desc">{{ t('settings.desc') }}</p>
            </header>

            <section class="page-demo-card">
                <h2 class="page-demo-card__title">{{ t('settings.theme.title') }}</h2>
                <p class="page-demo-hint">{{ t('settings.theme.desc') }}</p>

                <div class="page-demo-actions">
                    <AppButton :variant="theme === 'light' ? 'fill' : 'outline'" @click="setTheme('light')">
                        {{ t('theme.light') }}
                    </AppButton>
                    <AppButton :variant="theme === 'dark' ? 'fill' : 'outline'" @click="setTheme('dark')">
                        {{ t('theme.dark') }}
                    </AppButton>
                </div>
            </section>

            <section class="page-demo-card">
                <h2 class="page-demo-card__title">{{ t('settings.locale.title') }}</h2>
                <p class="page-demo-hint">{{ t('settings.locale.desc') }}</p>

                <div class="page-demo-actions">
                    <AppButton :variant="locale === 'ko' ? 'fill' : 'outline'" @click="setLocale('ko')">
                        {{ t('lang.ko') }}
                    </AppButton>
                    <AppButton :variant="locale === 'en' ? 'fill' : 'outline'" @click="setLocale('en')">
                        {{ t('lang.en') }}
                    </AppButton>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Locale } from '~/i18n'
import type { AppTheme } from '~/stores/preferences'
import { useI18nText } from '~/composables/useI18nText'
import { usePreferencesStore } from '~/stores/preferences'

const preferences = usePreferencesStore()
const { locale, theme } = storeToRefs(preferences)
const { t } = useI18nText()

function setLocale(next: Locale) {
    preferences.setLocale(next)
}

function setTheme(next: AppTheme) {
    preferences.setTheme(next)
}
</script>
