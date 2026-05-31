import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { AlertModalItem, ConfirmModalItem, CustomModalItem, ModalCloseReason, ModalItem, ModalOpenPayload } from '~/types/modal';

const MODAL_DEFAULTS = {
    common: {
        overlay: true,
        closable: true,
        closeOnDim: true,
        closeOnEsc: true,
        keepOnConfirm: false,
        width: '560px',
        height: undefined,
    },
    alert: {
        title: '안내',
        message: '',
        confirmText: '확인',
        width: '420px',
    },
    confirm: {
        title: '확인',
        message: '',
        confirmText: '확인',
        cancelText: '취소',
        width: '460px',
    },
    custom: {
        title: '',
        width: '560px',
        height: undefined,
        componentProps: {},
    },
} as const;

const MODAL_TYPE_DEFAULTS = {
    alert: MODAL_DEFAULTS.alert,
    confirm: MODAL_DEFAULTS.confirm,
    custom: MODAL_DEFAULTS.custom,
} as const;

export const useModalStore = defineStore('modal', () => {
    const modals = ref<ModalItem[]>([]);
    const sequence = ref(0);

    const topModalId = computed(() => {
        return modals.value.length ? modals.value[modals.value.length - 1].id : null;
    });

    function createId() {
        sequence.value += 1;
        return sequence.value;
    }

    function normalizePayload(payload: ModalOpenPayload): ModalItem {
        const base = {
            id: createId(),
            ...MODAL_DEFAULTS.common,
            ...MODAL_TYPE_DEFAULTS[payload.type],
            ...payload,
        };

        if (payload.type === 'alert') {
            return base as AlertModalItem;
        }

        if (payload.type === 'confirm') {
            return base as ConfirmModalItem;
        }

        return {
            ...base,
            componentProps: payload.componentProps ?? {},
        } as CustomModalItem;
    }

    function findModal(id: number) {
        return modals.value.find((modal) => modal.id === id);
    }

    function removeModal(id: number) {
        const index = modals.value.findIndex((modal) => modal.id === id);
        if (index < 0) return null;
        return modals.value.splice(index, 1)[0] ?? null;
    }

    function modalOpen(payload: ModalOpenPayload) {
        const modal = normalizePayload(payload);
        modals.value.push(modal);
        return modal.id;
    }

    function modalClose(id: number, reason: ModalCloseReason = 'close') {
        const target = removeModal(id);
        target?.onClose?.(reason);
    }

    function modalConfirm(id: number) {
        const modal = findModal(id);
        if (!modal || modal.type === 'custom') return;
        const shouldKeep = modal.keepOnConfirm === true;

        if (!shouldKeep) {
            modalClose(id, 'confirm');
        }

        modal.onConfirm?.();
    }

    function modalCancel(id: number) {
        const modal = findModal(id);
        if (!modal || modal.type !== 'confirm') return;
        modal.onCancel?.();
        modalClose(id, 'cancel');
    }

    function modalCloseTop(reason: ModalCloseReason = 'close') {
        const id = topModalId.value;
        if (id == null) return;
        modalClose(id, reason);
    }

    function clearAllModals() {
        const ids = modals.value.map((modal) => modal.id).reverse();
        ids.forEach((id) => modalClose(id, 'close'));
    }

    return {
        modals,
        topModalId,
        modalOpen,
        modalClose,
        modalConfirm,
        modalCancel,
        modalCloseTop,
        clearAllModals,
    };
});
