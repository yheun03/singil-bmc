<template>
    <Teleport to="body">
        <template v-for="(modalItem, modalIndex) in modalStore.modals" :key="modalItem.id">
            <component :is="getModalComponent(modalItem.type)" v-bind="getModalProps(modalItem, modalIndex)"
                @modal-close="handleModalClose" @modal-cancel="handleModalCancel" @modal-confirm="handleModalConfirm" />
        </template>
    </Teleport>
</template>

<script setup lang="ts">
import { useModalStore } from '~/stores/modal'
import type { ModalItem, ModalType, ModalViewCloseReason } from '~/types/modal'
import AppModalAlert from './AppModalAlert.vue'
import AppModalConfirm from './AppModalConfirm.vue'
import AppModalCustom from './AppModalCustom.vue'

const modalStore = useModalStore()
const modalComponentMap = {
    alert: AppModalAlert,
    confirm: AppModalConfirm,
    custom: AppModalCustom,
} as const

function getModalZIndex(modalIndex: number) {
    return 2000 + modalIndex * 10
}

function getModalComponent(type: ModalType) {
    return modalComponentMap[type]
}

function isTopModal(modalId: number) {
    return modalId === modalStore.topModalId
}

function getModalProps(modalItem: ModalItem, modalIndex: number) {
    return {
        id: modalItem.id,
        title: modalItem.title,
        width: modalItem.width,
        height: modalItem.height,
        overlay: modalItem.overlay,
        closable: modalItem.closable,
        closeOnDim: modalItem.closeOnDim,
        closeOnEsc: modalItem.closeOnEsc,
        zIndex: getModalZIndex(modalIndex),
        isTop: isTopModal(modalItem.id),
        ...(modalItem.type === 'alert'
            ? {
                message: modalItem.message,
                confirmText: modalItem.confirmText,
            }
            : {}),
        ...(modalItem.type === 'confirm'
            ? {
                message: modalItem.message,
                confirmText: modalItem.confirmText,
                cancelText: modalItem.cancelText,
            }
            : {}),
        ...(modalItem.type === 'custom'
            ? {
                component: modalItem.component,
                componentProps: modalItem.componentProps,
            }
            : {}),
    }
}

function handleModalClose(modalId: number | undefined | null, reason?: ModalViewCloseReason) {
    if (modalId == null) return
    modalStore.modalClose(modalId, reason)
}

function handleModalCancel(modalId: number | undefined | null) {
    if (modalId == null) return
    modalStore.modalCancel(modalId)
}

function handleModalConfirm(modalId: number | undefined | null) {
    if (modalId == null) return
    modalStore.modalConfirm(modalId)
}
</script>