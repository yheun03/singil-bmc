<template>
    <div :class="[
        'form-field',
        'app-select',
        `app-select--${size}`,
        `app-select--shape-${shape}`,
        {
            'app-select--open': isOpen,
            'is-readonly': readonly,
            'is-disabled': disabled,
            [`is-${state}`]: state
        }
    ]" ref="rootEl">

        <label v-if="label" class="form-field__label app-select__label" :for="selectId">
            {{ label }}
        </label>

        <div class="form-field__control app-select__control">
            <button :id="selectId" class="app-select__trigger" type="button" :name="name" :disabled="disabled"
                :aria-invalid="state === 'error'" :aria-describedby="describedBy" :aria-expanded="isOpen"
                :aria-readonly="readonly || undefined" aria-haspopup="listbox" @click="toggle">
                <span class="app-select__value" :class="{ 'app-select__value--placeholder': !selectedOption }">
                    {{ selectedOption?.label ?? placeholder }}
                </span>

                <span class="app-select__icon app-select__icon--right" aria-hidden="true">
                    <slot name="iconRight">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </slot>
                </span>
            </button>

            <ul v-if="isOpen" class="app-select__menu" role="listbox">
                <li v-if="placeholder && !required" class="app-select__option"
                    :class="{ 'is-selected': modelValue === null }" role="option" :aria-selected="modelValue === null"
                    @click="selectValue(null)">
                    {{ placeholder }}
                </li>

                <li v-for="opt in options" :key="getOptionKey(opt)" class="app-select__option" :class="{
                    'is-selected': modelValue === opt.value,
                    'is-disabled': !!opt.disabled
                }" role="option" :aria-selected="modelValue === opt.value" @click="selectValue(opt)">
                    {{ opt.label }}
                </li>
            </ul>
        </div>

        <p v-if="hint" class="form-field__hint app-select__hint" :id="hintId">
            {{ hint }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export type AppSelectOption = {
    value: string | number | boolean | null
    label: string
    disabled?: boolean
}

type SelectSize = 'xs' | 'sm' | 'md' | 'lg'
type SelectShape = 'square' | 'round' | 'pill' | 'underline'
type SelectState = 'error' | 'warning' | 'success' | null

const props = withDefaults(
    defineProps<{
        modelValue: string | number | boolean | null
        options: AppSelectOption[]
        label?: string
        hint?: string
        placeholder?: string
        required?: boolean
        size?: SelectSize
        shape?: SelectShape
        state?: SelectState
        disabled?: boolean
        readonly?: boolean
        id?: string
        name?: string
    }>(),
    {
        size: 'md',
        shape: 'round',
        state: null,
        placeholder: '선택하세요',
        required: false,
        disabled: false,
        readonly: false,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number | boolean | null): void
    (e: 'change', ev: Event): void
}>()

const fallbackId = useId()
const rootEl = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectId = computed(() => props.id ?? `app-select-${fallbackId}`)
const hintId = computed(() => `hint-${selectId.value}`)
const describedBy = computed(() => props.hint ? hintId.value : undefined)
const selectedOption = computed(() => props.options.find((opt) => opt.value === props.modelValue) ?? null)

function getOptionKey(option: AppSelectOption) {
    return `option-${String(option.value)}`
}

function toggle() {
    if (props.disabled || props.readonly) return
    isOpen.value = !isOpen.value
}

function close() {
    isOpen.value = false
}

function selectValue(option: AppSelectOption | null) {
    if (props.disabled || props.readonly) return
    if (option?.disabled) return

    emit('update:modelValue', option ? option.value : null)
    emit('change', new Event('change'))
    close()
}

function onDocumentClick(e: MouseEvent) {
    if (!isOpen.value) return
    if (!rootEl.value?.contains(e.target as Node)) close()
}

function onDocumentKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
}

onMounted(() => {
    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocumentClick)
    document.removeEventListener('keydown', onDocumentKeydown)
})
</script>