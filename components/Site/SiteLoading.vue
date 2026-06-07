<template>
    <p class="bmc-state" :class="{ 'bmc-state--error': error }">
        <slot>{{ error || '데이터를 불러오는 중...' }}</slot>
    </p>
</template>

<script setup lang="ts">
defineProps<{
    error?: boolean;
}>();
</script>
