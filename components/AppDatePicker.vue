<template>
    <div :class="[
        'form-field',
        'app-date-picker',
        `app-date-picker--${size}`,
        `app-date-picker--shape-${shape}`,
        {
            'is-readonly': readonly,
            'is-disabled': disabled,
            [`is-${state}`]: state
        }
    ]">
        <label v-if="label" class="form-field__label app-date-picker__label" :for="inputId">
            {{ label }}
        </label>

        <div class="form-field__control app-date-picker__control">
            <input :id="inputId" ref="inputEl" class="app-date-picker__field" type="text" :value="displayValue"
                :placeholder="placeholder" :disabled="disabled" :readonly="true" :aria-invalid="state === 'error'"
                :aria-describedby="describedBy" :aria-readonly="readonly || undefined" @keydown.prevent />
        </div>

        <p v-if="hint" class="form-field__hint app-date-picker__hint" :id="hintId">
            {{ hint }}
        </p>
    </div>
</template>

<script setup lang="ts">
import flatpickr from 'flatpickr'
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance'
import type { Options as FlatpickrOptions } from 'flatpickr/dist/types/options'
import 'flatpickr/dist/flatpickr.css'

export type DateRangeValue = {
    start: string | null
    end: string | null
}

type Mode = 'single' | 'range' | 'multiple'
type DatePickerSize = 'xs' | 'sm' | 'md' | 'lg'
type DatePickerShape = 'square' | 'round' | 'pill' | 'underline'
type DatePickerState = 'error' | 'warning' | 'success' | null

const props = withDefaults(
    defineProps<{
        modelValue: string | null | undefined | DateRangeValue | string[]
        label?: string
        hint?: string
        placeholder?: string
        mode?: Mode
        min?: string
        max?: string
        disabled?: boolean
        readonly?: boolean
        id?: string
        size?: DatePickerSize
        shape?: DatePickerShape
        state?: DatePickerState
    }>(),
    {
        mode: 'single',
        placeholder: '날짜 선택',
        disabled: false,
        readonly: false,
        size: 'md',
        shape: 'round',
        state: null,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | null | DateRangeValue | string[]): void
}>()

const fallbackId = useId()
const inputId = computed(() => props.id ?? `app-date-picker-${fallbackId}`)
const hintId = computed(() => `hint-${inputId.value}`)
const describedBy = computed(() => props.hint ? hintId.value : undefined)

const inputEl = ref<HTMLInputElement | null>(null)
let fp: FlatpickrInstance | null = null

const format = 'Y-m-d'

function toRangeValue(dates: Date[]): DateRangeValue | null {
    if (!dates?.length) return null

    const toStr = (d?: Date) => (d ? fp?.formatDate(d, format) ?? null : null)
    const start = toStr(dates[0])
    const end = toStr(dates[1])

    if (!start && !end) return null

    return { start, end }
}

function normalizeIncomingToDates(): Date[] {
    if (props.mode === 'single') {
        const value = props.modelValue as string | null | undefined
        return value ? [new Date(value)] : []
    }

    if (props.mode === 'multiple') {
        const value = props.modelValue as string[] | undefined
        return Array.isArray(value) ? value.filter(Boolean).map((item) => new Date(item)) : []
    }

    const value = props.modelValue as DateRangeValue | null | undefined
    const dates: Date[] = []

    if (value?.start) dates.push(new Date(value.start))
    if (value?.end) dates.push(new Date(value.end))

    return dates
}

const displayValue = computed(() => {
    if (props.mode === 'single') {
        return (props.modelValue as string | null) ?? ''
    }

    if (props.mode === 'multiple') {
        return Array.isArray(props.modelValue) ? (props.modelValue as string[]).join(', ') : ''
    }

    const range = props.modelValue as DateRangeValue | null
    if (!range) return ''

    return [range.start, range.end].filter(Boolean).join(' ~ ')
})

function onFlatpickrChange(selectedDates: Date[]) {
    if (props.readonly || props.disabled) return

    if (props.mode === 'single') {
        const date = selectedDates[0]
        emit('update:modelValue', date ? fp?.formatDate(date, format) ?? '' : null)
        return
    }

    if (props.mode === 'multiple') {
        const values = selectedDates
            .map((date) => fp?.formatDate(date, format) ?? '')
            .filter(Boolean)

        emit('update:modelValue', values)
        return
    }

    emit('update:modelValue', toRangeValue(selectedDates))
}

function buildOptions(): Partial<FlatpickrOptions> {
    return {
        mode: props.mode,
        dateFormat: format,
        allowInput: false,
        disableMobile: true,
        minDate: props.min,
        maxDate: props.max,
        clickOpens: !props.disabled && !props.readonly,
        onOpen: () => {
            if (props.disabled || props.readonly) {
                fp?.close()
            }
        },
        onChange: (selectedDates) => onFlatpickrChange(selectedDates),
    }
}

function syncFlatpickrState() {
    if (!fp) return

    fp.set('mode', props.mode)
    fp.set('minDate', props.min)
    fp.set('maxDate', props.max)
    fp.set('clickOpens', !props.disabled && !props.readonly)

    const nextDates = normalizeIncomingToDates()
    fp.setDate(nextDates, false)

    if (props.disabled || props.readonly) {
        fp.close()
    }
}

onMounted(() => {
    if (!inputEl.value) return

    fp = flatpickr(inputEl.value, buildOptions() as FlatpickrOptions)

    const initDates = normalizeIncomingToDates()
    if (initDates.length) {
        fp.setDate(initDates, false)
    }
})

onBeforeUnmount(() => {
    fp?.destroy()
    fp = null
})

watch(
    () => [props.modelValue, props.mode, props.min, props.max, props.disabled, props.readonly] as const,
    () => {
        syncFlatpickrState()
    },
    { deep: true },
)
</script>