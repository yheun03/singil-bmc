<template>
    <div>
        <SitePageHero :title="title" :description="description" :eyebrow="eyebrow" />
        <SiteLnb />
        <section class="bmc-section bmc-section--white">
            <div class="bmc-section__inner">
                <SiteLoading v-if="pending" />
                <p v-else-if="error" class="bmc-state bmc-state--error">{{ error }}</p>
                <slot v-else />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
    eyebrow?: string;
    pending?: boolean;
    error?: string;
}>();
</script>
