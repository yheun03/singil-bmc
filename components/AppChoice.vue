<template>
    <label :class="rootClasses">
        <span v-if="showIndicator" class="app-choice__control">
            <input :id="inputId" class="app-choice__input" :type="type" :name="name" :value="inputValue"
                :checked="isChecked" :disabled="disabled" :aria-invalid="state === 'error'"
                :aria-describedby="describedBy" :aria-readonly="readonly || undefined" @change="onChange" />

            <span class="app-choice__visual" aria-hidden="true">
                <span v-if="isChecked" class="app-choice__inner">
                    <template v-if="type === 'checkbox'">
                        <Icon icon="mdi:check" />
                    </template>

                    <template v-else>
                        <span class="app-choice__dot" />
                    </template>
                </span>
            </span>
        </span>

        <span v-if="hasBody" class="app-choice__body">
            <span v-if="label" class="app-choice__label">
                {{ label }}
            </span>

            <span v-if="hint" :id="hintId" class="app-choice__hint">
                {{ hint }}
            </span>
        </span>
    </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ChoiceType = 'checkbox' | 'radio'
type ChoiceVariant = 'default' | 'chip' | 'chip-outline' | 'fill' | 'ghost'
type ChoiceState = 'error' | 'warning' | 'success' | null
type ChoiceSize = 'md' | 'sm'
type ChoiceUiType = 'a' | 'b'

const CHIP_VARIANTS: ChoiceVariant[] = ['chip', 'chip-outline', 'fill', 'ghost']

const props = withDefaults(
    defineProps<{
        type?: ChoiceType
        modelValue: boolean | string | number | null
        value?: string | number
        name?: string
        label?: string
        hint?: string
        disabled?: boolean
        readonly?: boolean
        id?: string
        variant?: ChoiceVariant
        state?: ChoiceState
        size?: ChoiceSize
        uiType?: ChoiceUiType
    }>(),
    {
        type: 'checkbox',
        variant: 'default',
        state: null,
        disabled: false,
        readonly: false,
        size: 'md',
        uiType: 'a',
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean | string | number | null): void
}>()

const fallbackId = useId()

const inputId = computed(() => props.id ?? `app-choice-${fallbackId}`)
const hintId = computed(() => `${inputId.value}-hint`)
const describedBy = computed(() => (props.hint ? hintId.value : undefined))

const isChipVariant = computed(() => CHIP_VARIANTS.includes(props.variant))
const showIndicator = computed(() => !isChipVariant.value)
const hasBody = computed(() => Boolean(props.label || props.hint))
const inputValue = computed(() => props.value ?? '')

const isChecked = computed(() => {
    if (props.type === 'checkbox') {
        return Boolean(props.modelValue)
    }

    return props.value !== undefined && props.modelValue === props.value
})

const rootClasses = computed(() => [
    'app-choice',
    `app-choice--${props.type}`,
    `app-choice--${props.variant}`,
    `app-choice--${props.size}`,
    `app-choice--ui-${props.uiType}`,
    {
        'is-disabled': props.disabled,
        'is-readonly': props.readonly,
        'is-checked': isChecked.value,
        [`is-${props.state}`]: props.state,
    },
])

function onChange(event: Event) {
    if (props.readonly) {
        event.preventDefault()
        return
    }

    const target = event.target as HTMLInputElement

    if (props.type === 'checkbox') {
        emit('update:modelValue', target.checked)
        return
    }

    emit('update:modelValue', props.value ?? target.value ?? null)
}
</script>