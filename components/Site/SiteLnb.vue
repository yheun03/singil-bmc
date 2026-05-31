<template>
    <nav v-if="activeMenu" class="bmc-lnb" aria-label="하위 메뉴">
        <div class="bmc-lnb__inner">
            <div ref="listRef" class="bmc-lnb__list">
                <NuxtLink
                    v-for="item in activeMenu.items"
                    :key="item.to"
                    class="bmc-lnb__link"
                    :to="item.to"
                    :class="{ 'is-active': isActive(item.to) }"
                    :aria-current="isActive(item.to) ? 'page' : undefined"
                >
                    {{ item.label }}
                </NuxtLink>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
const route = useRoute();
const listRef = ref<HTMLElement | null>(null);
const { activeMenu, isActive } = useSiteLnb();

const activeIndex = computed(() => activeMenu.value?.items.findIndex((item) => isActive(item.to)) ?? -1);

function scrollActiveLink(behavior: ScrollBehavior = 'smooth') {
    const list = listRef.value;
    const index = activeIndex.value;

    if (!list || index < 0) {
        return;
    }

    const activeLink = list.children.item(index) as HTMLElement | null;
    activeLink?.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
}

onMounted(() => {
    scrollActiveLink('auto');
});

watch(
    () => route.path,
    async () => {
        await nextTick();
        scrollActiveLink();
    },
);
</script>
