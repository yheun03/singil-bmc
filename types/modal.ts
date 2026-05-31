import type { Component } from 'vue';

export type ModalType = 'alert' | 'confirm' | 'custom';
export type ModalCloseReason = 'esc' | 'backdrop' | 'close' | 'cancel' | 'confirm';

export type ModalViewCloseReason = Extract<ModalCloseReason, 'esc' | 'backdrop' | 'close'>;

export type ModalCommonOptions = {
    title?: string;
    width?: string;
    height?: string;
    overlay?: boolean;
    closable?: boolean;
    closeOnDim?: boolean;
    closeOnEsc?: boolean;
    keepOnConfirm?: boolean;
    onClose?: (reason?: ModalCloseReason) => void;
};

export type ModalBaseProps = {
    id: number;
    title?: string;
    width?: string;
    height?: string;
    zIndex?: number;
    overlay?: boolean;
    closable?: boolean;
    closeOnDim?: boolean;
    closeOnEsc?: boolean;
    isTop?: boolean;
};

export type ModalCloseEvent = {
    (e: 'modal-close', id: number, reason?: ModalViewCloseReason): void;
};

export type AlertModalInput = ModalCommonOptions & {
    type: 'alert';
    message?: string;
    confirmText?: string;
    onConfirm?: () => void;
};

export type ConfirmModalInput = ModalCommonOptions & {
    type: 'confirm';
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
};

export type CustomModalInput = ModalCommonOptions & {
    type: 'custom';
    component: Component;
    componentProps?: Record<string, unknown>;
};

export type ModalOpenPayload = AlertModalInput | ConfirmModalInput | CustomModalInput;

export type AlertModalItem = AlertModalInput & {
    id: number;
};

export type ConfirmModalItem = ConfirmModalInput & {
    id: number;
};

export type CustomModalItem = CustomModalInput & {
    id: number;
};

export type ModalItem = AlertModalItem | ConfirmModalItem | CustomModalItem;
