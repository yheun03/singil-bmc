<template>
    <div>
        <NuxtLayout v-if="useLayout">
            <!-- 라우트 전환 시 전체 페이지를 안전하게 리마운트 -->
            <NuxtPage :key="route.fullPath" />
        </NuxtLayout>
        <NuxtPage v-else :key="route.fullPath" />
    </div>


    <AppModalHost />
</template>

<script setup lang="ts">

import AppModalHost from '~/components/Modal/AppModalHost.vue'

const route = useRoute()

const useLayout = computed(() => {
    // page에서 definePageMeta({ layout: false })를 설정한 경우 레이아웃 제외
    if (route.meta?.layout === false) return false
    // 명시적으로 독립 노출되는 페이지들
    if (route.path === '/login') return false
    return true
})
</script>
