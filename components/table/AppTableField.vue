<template>
    <div class="app-table-field" :class="fieldClasses">
        <template v-if="cell.type === 'text'">
            <span class="app-table-field__text">
                {{ getValue(cell.key) }}
            </span>
        </template>

        <template v-else-if="cell.type === 'input'">
            <AppInput :model-value="stringValue(cell.key)" :placeholder="cell.placeholder" :readonly="mergedReadonly"
                :disabled="mergedDisabled" @update:model-value="(value) => updateField(cell.key, value)" />
        </template>

        <template v-else-if="cell.type === 'toggle'">
            <AppChoice type="checkbox" :model-value="booleanValue(cell.key)" :label="cell.text ?? cell.label"
                :readonly="mergedReadonly" :disabled="mergedDisabled"
                @update:model-value="(value) => updateField(cell.key, value)" />
        </template>

        <template v-else-if="cell.type === 'select'">
            <AppSelect :model-value="selectValue(cell.key)" :options="cell.options ?? []"
                :placeholder="cell.placeholder ?? '선택하세요'" :readonly="mergedReadonly" :disabled="mergedDisabled"
                @update:model-value="(value) => updateField(cell.key, value)" />
        </template>

        <template v-else-if="cell.type === 'textarea'">
            <textarea class="app-table-field__textarea" :rows="cell.rows ?? 3" :placeholder="cell.placeholder"
                :readonly="mergedReadonly" :disabled="mergedDisabled" :value="stringValue(cell.key)"
                @input="onTextareaInput(cell.key, $event)" />
        </template>

        <template v-else-if="cell.type === 'button'">
            <AppButton variant="outline" :disabled="mergedDisabled || mergedReadonly" @click="emitFieldAction">
                {{ cell.buttonText ?? '버튼' }}
            </AppButton>
        </template>

        <template v-else-if="cell.type === 'input_button'">
            <div class="app-table-field__inline">
                <AppInput class="app-table-field__inline-input" :model-value="stringValue(cell.key)"
                    :placeholder="cell.placeholder" :readonly="mergedReadonly" :disabled="mergedDisabled"
                    @update:model-value="(value) => updateField(cell.key, value)" />

                <AppButton class="app-table-field__inline-button" variant="outline"
                    :disabled="mergedDisabled || mergedReadonly" @click="emitFieldAction">
                    {{ cell.buttonText ?? '검색' }}
                </AppButton>
            </div>
        </template>

        <template v-else-if="cell.type === 'input_button-text'">
            <div class="app-table-field__inline">
                <AppInput class="app-table-field__inline-input" :model-value="stringValue(cell.key)"
                    :placeholder="cell.placeholder" :readonly="mergedReadonly" :disabled="mergedDisabled"
                    @update:model-value="(value) => updateField(cell.key, value)" />

                <AppButton class="app-table-field__inline-button" variant="outline"
                    :disabled="mergedDisabled || mergedReadonly" @click="emitFieldAction">
                    {{ cell.buttonText ?? '검색' }}
                </AppButton>

                <span v-if="cell.text" class="app-table-field__suffix-text">
                    {{ cell.text }}
                </span>
            </div>
        </template>

        <template v-else-if="cell.type === 'input-text'">
            <div class="app-table-field__inline">
                <AppInput class="app-table-field__inline-input" :model-value="stringValue(cell.key)"
                    :placeholder="cell.placeholder" :readonly="mergedReadonly" :disabled="mergedDisabled"
                    @update:model-value="(value) => updateField(cell.key, value)" />

                <span v-if="cell.text" class="app-table-field__suffix-text">
                    {{ cell.text }}
                </span>
            </div>
        </template>

        <template v-else-if="cell.type === 'text-button'">
            <div class="app-table-field__inline">
                <span class="app-table-field__text">
                    {{ cell.text || stringValue(cell.key) }}
                </span>

                <AppButton class="app-table-field__inline-button" variant="outline"
                    :disabled="mergedDisabled || mergedReadonly" @click="emitFieldAction">
                    {{ cell.buttonText ?? '버튼' }}
                </AppButton>
            </div>
        </template>

        <template v-else-if="cell.type === 'radio'">
            <div class="app-table-field__choice-group">
                <AppChoice v-for="option in cell.options ?? []" :key="String(option.value)"
                    :model-value="choiceValue(cell.key)" type="radio" :name="`radio-${cell.key}`"
                    :value="radioOptionValue(option.value)" :label="option.label" :readonly="mergedReadonly"
                    :disabled="mergedDisabled || !!option.disabled"
                    @update:model-value="(value) => updateField(cell.key, value)" />
            </div>
        </template>

        <template v-else-if="cell.type === 'checkbox'">
            <div class="app-table-field__choice-group">
                <AppChoice v-for="option in cell.options ?? []" :key="String(option.value)" type="checkbox"
                    :model-value="includesCheckboxValue(cell.key, option.value)" :label="option.label"
                    :readonly="mergedReadonly" :disabled="mergedDisabled || !!option.disabled"
                    @update:model-value="(checked) => updateCheckboxValue(cell.key, option.value, checked)" />
            </div>
        </template>

        <template v-else-if="cell.type === 'date'">
            <AppDatePicker :model-value="dateValue(cell.key)" :readonly="mergedReadonly" :disabled="mergedDisabled"
                @update:model-value="(value) => updateField(cell.key, value)" />
        </template>

        <template v-else-if="cell.type === 'range_date'">
            <AppDatePicker :model-value="rangeValue(cell.key)" mode="range" :readonly="mergedReadonly"
                :disabled="mergedDisabled" @update:model-value="(value) => updateField(cell.key, value)" />
        </template>

        <template v-else-if="cell.type === 'phone'">
            <div class="app-table-field__inline app-table-field__inline--phone">
                <AppInput v-for="(key, index) in cell.keys ?? []" :key="key" class="app-table-field__phone-input"
                    :model-value="stringValue(key)" :placeholder="cell.placeholders?.[index] ?? ''"
                    :readonly="mergedReadonly" :disabled="mergedDisabled"
                    @update:model-value="(value) => updateField(key, value)" />
            </div>
        </template>

        <template v-else-if="cell.type === 'email'">
            <div class="app-table-field__inline app-table-field__inline--email">
                <template v-for="(key, index) in cell.keys ?? []" :key="key">
                    <AppInput class="app-table-field__email-input" :model-value="stringValue(key)"
                        :placeholder="cell.placeholders?.[index] ?? ''" :readonly="mergedReadonly"
                        :disabled="mergedDisabled" @update:model-value="(value) => updateField(key, value)" />

                    <span v-if="index < (cell.keys?.length ?? 0) - 1" class="app-table-field__email-at">@</span>
                </template>
            </div>
        </template>

        <template v-else>
            <span class="app-table-field__text">
                {{ getValue(cell.key) }}
            </span>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { AppTableCell } from '~/types/table';
import type { DateRangeValue } from '~/components/AppDatePicker.vue'

const props = withDefaults(
    defineProps<{
        cell: AppTableCell
        modelValue: Record<string, unknown>
        readonly?: boolean
        disabled?: boolean
    }>(),
    {
        readonly: false,
        disabled: false,
    },
)

const emit = defineEmits<{
    (e: 'update-field', payload: { key: string; value: unknown }): void
    (e: 'field-action', cell: AppTableCell): void
}>()

const mergedReadonly = computed(() => props.readonly || !!props.cell.readonly)
const mergedDisabled = computed(() => props.disabled || !!props.cell.disabled)

const fieldClasses = computed(() => ({
    'is-readonly': mergedReadonly.value,
    'is-disabled': mergedDisabled.value,
    [`is-type-${props.cell.type}`]: !!props.cell.type,
}))

function getValue(key?: string) {
    if (!key) return ''
    return props.modelValue?.[key] ?? ''
}

function stringValue(key?: string) {
    const value = getValue(key)
    return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function booleanValue(key?: string) {
    return Boolean(getValue(key))
}

function selectValue(key?: string) {
    const value = getValue(key)
    return value == null || value === '' ? null : (value as string | number | boolean)
}

function choiceValue(key?: string) {
    const value = getValue(key)
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null
        ? value
        : null
}

function radioOptionValue(value: string | number | boolean | null) {
    return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

function dateValue(key?: string) {
    const value = getValue(key)
    return typeof value === 'string' ? value : null
}

function rangeValue(key?: string): DateRangeValue | null {
    const value = getValue(key)

    if (
        value &&
        typeof value === 'object' &&
        'start' in (value as Record<string, unknown>) &&
        'end' in (value as Record<string, unknown>)
    ) {
        return value as DateRangeValue
    }

    return null
}

function updateField(key: string | undefined, value: unknown) {
    if (!key) return
    emit('update-field', { key, value })
}

function emitFieldAction() {
    emit('field-action', props.cell)
}

function onTextareaInput(key: string | undefined, event: Event) {
    const target = event.target as HTMLTextAreaElement
    updateField(key, target.value)
}

function includesCheckboxValue(key: string | undefined, value: unknown) {
    const current = getValue(key)
    return Array.isArray(current) ? current.includes(value) : false
}

function updateCheckboxValue(key: string | undefined, optionValue: unknown, checked: unknown) {
    if (!key) return

    const current = getValue(key)
    const next = Array.isArray(current) ? [...current] : []

    if (checked) {
        if (!next.includes(optionValue)) next.push(optionValue)
    } else {
        const index = next.indexOf(optionValue)
        if (index > -1) next.splice(index, 1)
    }

    updateField(key, next)
}
</script>