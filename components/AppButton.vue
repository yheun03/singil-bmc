<template>
    <component :is="tag" v-bind="componentAttrs" :class="classes" :style="customSizeStyle"
        :aria-label="ariaLabelComputed" :aria-disabled="ariaDisabled" :aria-busy="loading ? 'true' : undefined"
        :tabindex="tabIndex" @click="onClick">
        <!-- loading -->
        <span v-if="loading" class="app-button__spinner" aria-hidden="true" />

        <!-- left icon -->
        <i v-else-if="$slots.iconLeft" class="app-button__icon app-button__icon--left" aria-hidden="true">
            <slot name="iconLeft" />
        </i>

        <!-- label -->
        <span v-if="$slots.default" class="app-button__label">
            <slot />
        </span>

        <!-- right icon -->
        <i v-if="$slots.iconRight && !loading" class="app-button__icon app-button__icon--right" aria-hidden="true">
            <slot name="iconRight" />
        </i>
    </component>
</template>

<script setup lang="ts">
const attrs = useAttrs()

type ButtonVariant = 'fill' | 'outline' | 'text' | 'underline'
type ButtonShape = 'square' | 'round' | 'pill'
type ButtonTone =
    | 'primary'
    | 'secondary'
    | 'gray'
    | 'danger'
    | 'warning'
    | 'success'
    | 'info'

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom'
type ButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(
    defineProps<{
        type?: ButtonType
        to?: string
        href?: string
        newTab?: boolean

        variant?: ButtonVariant
        shape?: ButtonShape
        tone?: ButtonTone
        size?: ButtonSize

        customSize?: {
            width: number
            height?: number
        }

        disabled?: boolean
        loading?: boolean
        block?: boolean
        iconOnly?: boolean
        ariaLabel?: string
    }>(),
    {
        type: 'button',
        variant: 'outline',
        shape: 'round',
        tone: 'gray',
        size: 'md',
        newTab: false,
        disabled: false,
        loading: false,
        block: false,
        iconOnly: false
    }
)

const emit = defineEmits<{
    click: [MouseEvent]
}>()

const NuxtLinkComp = resolveComponent('NuxtLink')

/* -------------------------------------------------------
   상태
------------------------------------------------------- */

const isDisabled = computed(() => props.disabled || props.loading)
const isLink = computed(() => !!props.to || !!props.href)

/* -------------------------------------------------------
   component tag
------------------------------------------------------- */

const tag = computed(() => {
    if (props.to) return NuxtLinkComp
    if (props.href) return 'a'
    return 'button'
})

/* -------------------------------------------------------
   attributes
------------------------------------------------------- */

const componentAttrs = computed(() => {
    if (props.to) {
        return {
            to: props.to,
            ...attrs
        }
    }

    if (props.href) {
        return {
            href: props.href,
            target: props.newTab ? '_blank' : undefined,
            rel: props.newTab ? 'noopener noreferrer' : undefined,
            ...attrs
        }
    }

    return {
        type: props.type,
        disabled: isDisabled.value,
        ...attrs
    }
})

/* -------------------------------------------------------
   accessibility
------------------------------------------------------- */

const ariaLabelComputed = computed(() => {
    if (!props.iconOnly) return undefined
    return props.ariaLabel
})

const ariaDisabled = computed(() => {
    if (!isLink.value) return undefined
    return isDisabled.value ? 'true' : undefined
})

const tabIndex = computed(() => {
    if (isLink.value && isDisabled.value) return -1
    return undefined
})

/* -------------------------------------------------------
   custom size
------------------------------------------------------- */

const customSizeStyle = computed(() => {
    if (!props.customSize) return

    return {
        width: `${props.customSize.width}px`,
        height: `${props.customSize.height ?? props.customSize.width}px`
    }
})

/* -------------------------------------------------------
   classes
------------------------------------------------------- */

const classes = computed(() => [
    'app-button',
    `app-button--variant-${props.variant}`,
    `app-button--shape-${props.shape}`,
    `app-button--size-${props.size}`,
    `app-button--tone-${props.tone}`,
    {
        'app-button--icon-only': props.iconOnly,
        'app-button--disabled': isDisabled.value,
        'app-button--loading': props.loading,
        'app-button--block': props.block,
        'app-button--custom': !!props.customSize
    }
])

/* -------------------------------------------------------
   click
------------------------------------------------------- */

function onClick(e: MouseEvent) {
    if (isDisabled.value) {
        e.preventDefault()
        e.stopPropagation()
        return
    }

    emit('click', e)
}
</script>