<template>
    <section class="bmc-page-hero">
        <div class="bmc-page-hero__inner">
            <p v-if="eyebrow" class="bmc-page-hero__eyebrow">{{ eyebrow }}</p>
            <h1 class="bmc-page-hero__title">{{ title }}</h1>
            <p v-if="description" class="bmc-page-hero__desc">{{ description }}</p>
        </div>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
    eyebrow?: string;
}>();
</script>
