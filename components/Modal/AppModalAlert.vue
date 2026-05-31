<template>
    <AppModalBase :id="id" :title="title" :width="width" :height="height" :z-index="zIndex" :overlay="overlay"
        :closable="closable" :close-on-dim="closeOnDim" :close-on-esc="closeOnEsc" :is-top="isTop"
        @modal-close="onClose">
        <div class="app-alert-modal__message">
            {{ message }}
        </div>

        <template #footer>
            <div class="app-alert-modal__actions">
                <AppButton variant="fill" @click="onConfirm">
                    {{ confirmText }}
                </AppButton>
            </div>
        </template>
    </AppModalBase>
</template>

<script setup lang="ts">
import AppModalBase from './AppModalBase.vue'
import type { ModalBaseProps, ModalCloseEvent, ModalViewCloseReason } from '~/types/modal'

const props = defineProps<ModalBaseProps & {
    message?: string
    confirmText?: string
}>()

const emit = defineEmits<ModalCloseEvent & {
    (e: 'modal-confirm', id: number): void
}>()

function onClose(id: number, reason: ModalViewCloseReason) {
    emit('modal-close', id, reason)
}

function onConfirm() {
    emit('modal-confirm', props.id)
}
</script>