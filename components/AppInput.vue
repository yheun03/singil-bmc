<template>
    <div
        :class="['form-field', 'app-input', `app-input--${size}`, `app-input--shape-${shape}`, { 'app-input--icon-left': hasIconLeft, 'app-input--icon-right': hasIconRight || clearable || passwordToggle, 'is-disabled': disabled, [`is-${state}`]: state }]">

        <!-- label -->
        <label v-if="label" class="form-field__label app-input__label" :for="inputId">{{ label }}</label>

        <!-- control -->
        <div class="form-field__control app-input__control">

            <!-- left icon -->
            <span v-if="hasIconLeft" class="app-input__icon app-input__icon--left">
                <slot name="iconLeft" />
            </span>

            <!-- input -->
            <input :id="inputId" class="app-input__field" :type="computedType" :value="modelValue ?? ''"
                :placeholder="placeholder" :name="name" :autocomplete="autocomplete" :disabled="disabled"
                :readonly="readonly" :aria-invalid="state === 'error'" :aria-describedby="describedBy"
                @input="onInput" />

            <!-- clear -->
            <button v-if="clearable && modelValue" class="app-input__icon app-input__icon--right" type="button"
                @click="clear">
                <Icon icon="mdi:close" />
            </button>

            <!-- password toggle -->
            <button v-if="passwordToggle" class="app-input__icon app-input__icon--right" type="button"
                @click="togglePassword">
                <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" />
            </button>

            <!-- slot right -->
            <span v-if="hasIconRight" class="app-input__icon app-input__icon--right">
                <slot name="iconRight" />
            </span>
        </div>

        <!-- hint -->
        <p v-if="hint" class="form-field__hint app-input__hint" :id="hintId">{{ hint }}</p>
    </div>

</template>



<script setup lang="ts">

import { computed, useSlots, ref } from 'vue'

type InputSize = 'xs' | 'sm' | 'md' | 'lg'
type InputShape = 'square' | 'round' | 'pill' | 'underline'
type InputState = 'error' | 'warning' | 'success' | null


const props = withDefaults(
    defineProps<{

        modelValue: string | number | null

        label?: string
        hint?: string

        placeholder?: string
        type?: string

        size?: InputSize
        shape?: InputShape

        state?: InputState

        disabled?: boolean
        readonly?: boolean

        clearable?: boolean
        passwordToggle?: boolean

        id?: string
        name?: string
        autocomplete?: string

    }>(),
    {
        size: 'md',
        shape: 'round',
        state: null,
        type: 'text',
        disabled: false,
        readonly: false,
        clearable: false,
        passwordToggle: false
    })



const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()


const fallbackId = useId()

const inputId = computed(() => props.id ?? `app-input-${fallbackId}`)

const hintId = computed(() => `hint-${inputId.value}`)

const describedBy = computed(() => props.hint ? hintId.value : undefined)


const slots = useSlots()

const hasIconLeft = computed(() => !!slots.iconLeft)

const hasIconRight = computed(() => !!slots.iconRight)


/* password */

const showPassword = ref(false)

const computedType = computed(() => {

    if (props.passwordToggle) {
        return showPassword.value ? 'text' : 'password'
    }

    return props.type

})


function togglePassword() {

    showPassword.value = !showPassword.value

}


/* clear */

function clear() {

    emit('update:modelValue', '')

}


/* input */

function onInput(e: Event) {

    const target = e.target as HTMLInputElement

    emit('update:modelValue', target.value)

}

</script>