<template>
    <div class="app-image-viewer">
        <img class="app-image-viewer__image" :src="src" :alt="alt" />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    src: string
    alt?: string
}>()
</script>
