<template>
    <div class="app-grid-toolbar">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'

const props = defineProps<{
    target: string
}>()

/* 하위 컴포넌트에 grid target 제공 */
provide('appGridTarget', props.target)
</script>