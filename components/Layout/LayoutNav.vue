<template>
    <nav class="layout-nav" aria-label="Sidebar navigation">
        <div class="layout-nav__header">
            <NuxtLink class="layout-nav__brand" to="/">
                <div class="layout-nav__logo nav-logo" aria-hidden="true">
                    <span class="nav-logo__mark" v-html="logoSvg" />
                </div>
                <span class="layout-nav__site-name">신길교회<br>야구 선교단</span>
            </NuxtLink>
        </div>

        <div class="layout-nav__body">
            <div class="layout-nav__list-wrap">
                <ul class="layout-nav__list" role="menubar" :aria-label="t('nav.home')">
                    <LayoutNavItem v-for="menu in menuTree" :key="menu.id" :item="menu" :get-icon-svg="getIconSvg" />
                </ul>
            </div>
        </div>

        <div class="layout-nav__footer">
            <AppButton class="nav-action" variant="text" size="custom" :custom-size="{ width: 32, height: 32 }"
                :ariaLabel="t('nav.contact')" to="/contact">
                <template #iconLeft>
                    <Icon icon="mdi:email-outline" aria-hidden="true" />
                </template>
            </AppButton>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import logoSvg from '~/assets/icons/logo.svg?raw'
import { useI18nText } from '~/composables/useI18nText'
import { useNavigationStore } from '~/stores/navigation'

const { t } = useI18nText()
const navigationStore = useNavigationStore()
const { menuTree } = storeToRefs(navigationStore)
const getIconSvg = () => null

callOnce('navigation:menus', () => navigationStore.fetchMenus())
</script>
