<template>
    <div class="app-form-field" :class="{
        'is-required': required,
        'is-disabled': disabled,
        'is-error': hasError,
    }">
        <div v-if="label || $slots.label" class="app-form-field__head">
            <label v-if="label" class="app-form-field__label" :for="forId">
                {{ label }}

                <span v-if="required" class="app-form-field__required" aria-hidden="true">
                    *
                </span>
            </label>

            <slot v-else name="label" />

            <span v-if="optionalText && !required" class="app-form-field__optional">
                {{ optionalText }}
            </span>
        </div>

        <p v-if="description" class="app-form-field__description">
            {{ description }}
        </p>

        <div class="app-form-field__control">
            <slot :id="forId" :invalid="hasError" :disabled="disabled" :describedby="describedBy" />
        </div>

        <p v-if="hasError" :id="errorId" class="app-form-field__message app-form-field__message--error">
            {{ errorMessage }}
        </p>

        <p v-else-if="hint" :id="hintId" class="app-form-field__message app-form-field__message--hint">
            {{ hint }}
        </p>
    </div>
</template>

<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        label?: string
        for?: string
        required?: boolean
        disabled?: boolean
        description?: string
        hint?: string
        error?: string | boolean | null
        optionalText?: string
    }>(),
    {
        label: '',
        for: '',
        required: false,
        disabled: false,
        description: '',
        hint: '',
        error: null,
        optionalText: '선택',
    },
)

const uid = useId()

const forId = computed(() => props.for || `app-form-field-${uid}`)
const errorId = computed(() => `${forId.value}-error`)
const hintId = computed(() => `${forId.value}-hint`)

const hasError = computed(() => Boolean(props.error))

const errorMessage = computed(() => {
    if (typeof props.error === 'string') {
        return props.error
    }

    return '입력값을 확인해주세요.'
})

const describedBy = computed(() => {
    if (hasError.value) return errorId.value
    if (props.hint) return hintId.value

    return undefined
})
</script>