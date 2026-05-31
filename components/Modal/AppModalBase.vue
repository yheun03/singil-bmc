<template>
    <div class="app-modal" :style="{ zIndex: String(zIndex) }">
        <div v-if="overlay" class="app-modal__backdrop" @click="onBackdropClick" />

        <div class="app-modal__dialog" :style="dialogStyle" role="dialog" aria-modal="true" :aria-label="ariaLabel"
            @click.stop>
            <header v-if="title || $slots.header" class="app-modal__header">
                <div class="app-modal__header-left">
                    <slot name="header">
                        <h2 class="app-modal__title">{{ title }}</h2>
                    </slot>
                </div>

                <AppButton v-if="closable" class="app-modal__close" variant="text" size="custom"
                    :custom-size="{ width: 34, height: 34 }" aria-label="닫기" @click="emitClose('close')">
                    <template #iconLeft>
                        <Icon icon="mdi:close" />
                    </template>
                </AppButton>
            </header>

            <section class="app-modal__body">
                <slot />
            </section>

            <footer v-if="$slots.footer" class="app-modal__footer">
                <slot name="footer" />
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
type CloseReason = 'esc' | 'backdrop' | 'close'

const props = withDefaults(
    defineProps<{
        id: number
        title?: string
        ariaLabel?: string
        width?: string
        height?: string
        zIndex?: number
        overlay?: boolean
        closable?: boolean
        closeOnDim?: boolean
        closeOnEsc?: boolean
        isTop?: boolean
    }>(),
    {
        title: '',
        ariaLabel: '모달',
        width: '560px',
        height: undefined,
        zIndex: 2000,
        overlay: true,
        closable: true,
        closeOnDim: true,
        closeOnEsc: true,
        isTop: true,
    },
)

const emit = defineEmits<{
    (e: 'modal-close', id: number, reason: CloseReason): void
}>()

const dialogStyle = computed(() => ({
    width: props.width,
    height: props.height,
}))

function emitClose(reason: CloseReason) {
    emit('modal-close', props.id, reason)
}

function onBackdropClick() {
    if (!props.closeOnDim) return
    if (!props.isTop) return
    emitClose('backdrop')
}

function onKeydown(event: KeyboardEvent) {
    if (!props.closeOnEsc) return
    if (!props.isTop) return
    if (event.key !== 'Escape') return

    event.preventDefault()
    emitClose('esc')
}

onMounted(() => {
    if (import.meta.server) return
    window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    if (import.meta.server) return
    window.removeEventListener('keydown', onKeydown)
})
</script>