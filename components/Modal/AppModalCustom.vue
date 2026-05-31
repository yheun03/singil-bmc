<template>
    <AppModalBase :id="id" :title="title" :width="width" :height="height" :z-index="zIndex" :overlay="overlay"
        :closable="closable" :close-on-dim="closeOnDim" :close-on-esc="closeOnEsc" :is-top="isTop"
        @modal-close="onClose">
        <component :is="component" v-bind="componentProps" />
    </AppModalBase>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import AppModalBase from './AppModalBase.vue'
import type { ModalBaseProps, ModalCloseEvent, ModalViewCloseReason } from '~/types/modal'

const props = withDefaults(
    defineProps<ModalBaseProps & {
        component: Component
        componentProps?: Record<string, unknown>
    }>(),
    {
        componentProps: () => ({}),
    },
)

const emit = defineEmits<ModalCloseEvent>()

function onClose(id: number, reason: ModalViewCloseReason) {
    emit('modal-close', id, reason)
}
</script>