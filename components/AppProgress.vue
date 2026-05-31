<template>
    <div :class="rootClasses">
        <div class="app-progress__linear">

            <!-- single control -->
            <div v-if="isSingleControl" class="app-progress__control">
                <label v-if="label" class="app-progress__control-label">
                    {{ label }}
                </label>

                <div ref="singleEl" class="app-progress__noui" role="slider" aria-orientation="horizontal"
                    :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="singleValue" />

                <div v-if="showLabel" class="app-progress__control-value">
                    {{ singleValue }}%
                </div>
            </div>

            <!-- range control -->
            <div v-else-if="isRangeControl" ref="rangeEl" class="app-progress__noui" role="group"
                aria-label="프로그레스 범위 선택" />

            <!-- display -->
            <div v-else class="app-progress__track" role="progressbar" :aria-valuenow="displayEnd" aria-valuemin="0"
                aria-valuemax="100">
                <div class="app-progress__bar-range" :style="rangeStyle" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import noUiSlider from 'nouislider'
import type { API as NoUiSliderApi } from 'nouislider'
import 'nouislider/dist/nouislider.css'

type Variant = 'linear'
type Mode = 'display' | 'control-single' | 'control-range'

type ProgressRange = {
    start: number
    end: number
}

const props = withDefaults(
    defineProps<{
        value: number
        range?: ProgressRange
        rangeSelectable?: boolean
        mode?: Mode
        label?: string
        disabled?: boolean
        variant?: Variant
        showLabel?: boolean
    }>(),
    {
        variant: 'linear',
        mode: 'display',
        showLabel: false,
        rangeSelectable: false,
        label: undefined,
        disabled: false,
    },
)

const emit = defineEmits<{
    (e: 'update:range', value: ProgressRange): void
    (e: 'update:value', value: number): void
}>()

function clamp(value: number) {
    const next = Number(value)

    if (Number.isNaN(next)) {
        return 0
    }

    return Math.min(100, Math.max(0, Math.round(next)))
}

function normalizeRange(range?: ProgressRange): ProgressRange {
    if (!range) {
        return {
            start: 0,
            end: 0,
        }
    }

    const start = clamp(range.start)
    const end = clamp(range.end)

    return {
        start: Math.min(start, end),
        end: Math.max(start, end),
    }
}

function isSameRange(a: ProgressRange, b: ProgressRange) {
    return a.start === b.start && a.end === b.end
}

const singleEl = ref<HTMLElement | null>(null)
const rangeEl = ref<HTMLElement | null>(null)

const rootClasses = computed(() => [
    'app-progress',
    `app-progress--${props.variant}`,
    `app-progress--${props.mode}`,
    {
        'is-disabled': props.disabled,
    },
])

const singleValue = computed(() => clamp(props.value))
const normalizedRange = computed(() => normalizeRange(props.range))

const displayStart = computed(() => normalizedRange.value.start)
const displayEnd = computed(() => {
    if (props.range) {
        return normalizedRange.value.end
    }

    return singleValue.value
})

const isSingleControl = computed(() => {
    return props.variant === 'linear' && props.mode === 'control-single'
})

const isRangeControl = computed(() => {
    return props.variant === 'linear' && !!props.range && (props.mode === 'control-range' || props.rangeSelectable)
})

const rangeStyle = computed(() => ({
    '--start': displayStart.value,
    '--end': displayEnd.value,
}))

/* -------------------------------------------------------------------------- */
/* private slider manager */
/* -------------------------------------------------------------------------- */
function createSliderManagers() {
    let singleSlider: NoUiSliderApi | null = null
    let rangeSlider: NoUiSliderApi | null = null

    function destroySingleSlider() {
        if (!singleSlider) return
        singleSlider.destroy()
        singleSlider = null
    }

    function destroyRangeSlider() {
        if (!rangeSlider) return
        rangeSlider.destroy()
        rangeSlider = null
    }

    function syncSingleSlider() {
        if (!isSingleControl.value) {
            destroySingleSlider()
            return
        }

        if (!singleEl.value) return

        if (!singleSlider) {
            singleSlider = noUiSlider.create(singleEl.value, {
                start: [singleValue.value],
                connect: [true, false],
                range: { min: 0, max: 100 },
                step: 1,
                behaviour: 'tap-drag',
                animate: false,
                animationDuration: 0,
            })

            const handleSingle = (values: (number | string)[]) => {
                const next = clamp(Number(values[0]))

                if (next !== singleValue.value) {
                    emit('update:value', next)
                }
            }

            singleSlider.on('slide', handleSingle)
            singleSlider.on('set', handleSingle)
        } else {
            const raw = singleSlider.get()
            const current = Number(Array.isArray(raw) ? raw[0] : raw)

            if (!Number.isNaN(current) && clamp(current) !== singleValue.value) {
                singleSlider.set([singleValue.value])
            }
        }

        if (props.disabled) singleSlider.disable()
        else singleSlider.enable()
    }

    function syncRangeSlider() {
        if (!isRangeControl.value) {
            destroyRangeSlider()
            return
        }

        if (!rangeEl.value) return

        if (!rangeSlider) {
            rangeSlider = noUiSlider.create(rangeEl.value, {
                start: [normalizedRange.value.start, normalizedRange.value.end],
                connect: true,
                range: { min: 0, max: 100 },
                step: 1,
                behaviour: 'tap-drag',
                animate: false,
                animationDuration: 0,
            })

            const handleRange = (values: (number | string)[]) => {
                const next = normalizeRange({
                    start: Number(values[0]),
                    end: Number(values[1]),
                })

                if (!isSameRange(next, normalizedRange.value)) {
                    emit('update:range', next)
                }
            }

            rangeSlider.on('slide', handleRange)
            rangeSlider.on('set', handleRange)
        } else {
            const raw = rangeSlider.get()
            const current = Array.isArray(raw)
                ? normalizeRange({
                    start: Number(raw[0]),
                    end: Number(raw[1]),
                })
                : normalizedRange.value

            if (!isSameRange(current, normalizedRange.value)) {
                rangeSlider.set([normalizedRange.value.start, normalizedRange.value.end])
            }
        }

        if (props.disabled) rangeSlider.disable()
        else rangeSlider.enable()
    }

    function destroyAll() {
        destroySingleSlider()
        destroyRangeSlider()
    }

    return {
        syncSingleSlider,
        syncRangeSlider,
        destroyAll,
    }
}

const sliderManagers = createSliderManagers()

onMounted(() => {
    sliderManagers.syncSingleSlider()
    sliderManagers.syncRangeSlider()
})

onBeforeUnmount(() => {
    sliderManagers.destroyAll()
})

watch(
    [isSingleControl, singleValue, () => props.disabled],
    () => {
        sliderManagers.syncSingleSlider()
    },
)

watch(
    [isRangeControl, normalizedRange, () => props.disabled],
    () => {
        sliderManagers.syncRangeSlider()
    },
    { deep: true },
)
</script>