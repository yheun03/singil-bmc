<template>
    <Teleport to="#layout__page-bottom-fixed">
        <div class="layout__page-bottom-fixed__content">
            <div v-if="$slots.left" class="layout__page-bottom-fixed__left">
                <slot name="left" />
            </div>
            <div v-if="$slots.default || $slots.right" class="layout__page-bottom-fixed__right">
                <slot name="right">
                    <slot />
                </slot>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
</script>
