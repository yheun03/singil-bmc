<template>
    <div :class="rootClasses">
        <div class="app-progress-gauge__svg-wrap">
            <svg ref="svgEl" class="app-progress-gauge__svg" viewBox="0 0 120 70" role="img" :aria-label="ariaLabel"
                @pointerdown="onTrackPointerDown">
                <!-- track -->
                <path class="app-progress-gauge__track" :d="trackPath" :stroke-width="strokeWidth" />

                <!-- range -->
                <path v-if="hasRange" class="app-progress-gauge__range" :d="rangePath" :stroke-width="strokeWidth" />

                <!-- value -->
                <path v-if="isGauge" class="app-progress-gauge__value" :d="valuePath" :stroke-width="strokeWidth" />

                <!-- range handles -->
                <circle v-if="showRangeHandles" class="app-progress-gauge__handle app-progress-gauge__handle--start"
                    :cx="rangeStartPoint.x" :cy="rangeStartPoint.y" r="4"
                    @pointerdown.stop="onHandlePointerDown('start', $event)" />

                <circle v-if="showRangeHandles" class="app-progress-gauge__handle app-progress-gauge__handle--end"
                    :cx="rangeEndPoint.x" :cy="rangeEndPoint.y" r="4"
                    @pointerdown.stop="onHandlePointerDown('end', $event)" />

                <!-- needle -->
                <line v-if="showValueNeedle" class="app-progress-gauge__needle" :x1="center.x" :y1="center.y"
                    :x2="needlePoint.x" :y2="needlePoint.y" />

                <circle v-if="showValueNeedle" class="app-progress-gauge__needle-center" :cx="center.x" :cy="center.y"
                    r="3.5" />

            </svg>

            <div v-if="showContent" class="app-progress-gauge__content">
                <div v-if="label" class="app-progress-gauge__label">
                    {{ label }}
                </div>

                <div v-if="showValue" class="app-progress-gauge__value-text">
                    {{ normalizedValue }}
                </div>

                <div v-if="showRangeText && hasRange" class="app-progress-gauge__range-text">
                    {{ normalizedRange.start }} ~ {{ normalizedRange.end }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type GaugeType = 'gauge' | 'semi-doughnut-range'
type GaugeMode = 'display' | 'control-single' | 'control-range'
type ActiveHandle = 'value' | 'start' | 'end' | null

type ProgressRange = {
    start: number
    end: number
}

const VIEWBOX_WIDTH = 120
const VIEWBOX_HEIGHT = 70
const CENTER = { x: 60, y: 60 }
const RADIUS = 44

const props = withDefaults(
    defineProps<{
        type?: GaugeType
        mode?: GaugeMode
        value?: number
        range?: ProgressRange
        min?: number
        max?: number
        step?: number
        label?: string
        disabled?: boolean
        showLabel?: boolean
        showValue?: boolean
        showRangeText?: boolean
        showNeedle?: boolean
        strokeWidth?: number
    }>(),
    {
        type: 'gauge',
        mode: 'display',
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        disabled: false,
        showLabel: true,
        showValue: true,
        showRangeText: true,
        showNeedle: true,
        strokeWidth: 5,
    },
)

const emit = defineEmits<{
    (e: 'update:value', value: number): void
    (e: 'update:range', value: ProgressRange): void
}>()

const svgEl = ref<SVGSVGElement | null>(null)

/* -------------------------------------------------------------------------- */
/* utils */
/* -------------------------------------------------------------------------- */
function clamp(value: number, min: number, max: number) {
    const next = Number(value)

    if (Number.isNaN(next)) {
        return min
    }

    return Math.min(max, Math.max(min, next))
}

function roundByStep(value: number, step: number) {
    if (step <= 0) {
        return value
    }

    return Math.round(value / step) * step
}

function normalizeValue(value: number, min: number, max: number, step: number) {
    return roundByStep(clamp(value, min, max), step)
}

function normalizeRange(range: ProgressRange | undefined, min: number, max: number, step: number): ProgressRange {
    if (!range) {
        return { start: min, end: min }
    }

    const start = normalizeValue(range.start, min, max, step)
    const end = normalizeValue(range.end, min, max, step)

    return {
        start: Math.min(start, end),
        end: Math.max(start, end),
    }
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
    const rad = (angle * Math.PI) / 180

    return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad),
    }
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, radius, startAngle)
    const end = polarToCartesian(cx, cy, radius, endAngle)
    const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

function valueToRatio(value: number, min: number, max: number) {
    if (max <= min) {
        return 0
    }

    return (value - min) / (max - min)
}

function ratioToAngle(ratio: number) {
    return -180 + ratio * 180
}

function valueToAngle(value: number, min: number, max: number) {
    return ratioToAngle(valueToRatio(value, min, max))
}

/* -------------------------------------------------------------------------- */
/* state */
/* -------------------------------------------------------------------------- */
const bounds = computed(() => ({
    min: props.min,
    max: props.max,
    step: props.step,
}))

const normalizedValue = computed(() => {
    const { min, max, step } = bounds.value
    return normalizeValue(props.value, min, max, step)
})

const normalizedRange = computed(() => {
    const { min, max, step } = bounds.value
    return normalizeRange(props.range, min, max, step)
})

const isGauge = computed(() => props.type === 'gauge')
const hasRange = computed(() => !!props.range)

const isControlSingle = computed(() => props.mode === 'control-single')
const isControlRange = computed(() => props.mode === 'control-range' && hasRange.value)

const showValueNeedle = computed(() => isGauge.value && props.showNeedle)
const showRangeHandles = computed(() => isControlRange.value)
const showContent = computed(() => props.showLabel || props.showValue || props.showRangeText)

const rootClasses = computed(() => [
    'app-progress-gauge',
    `app-progress-gauge--${props.type}`,
    `app-progress-gauge--${props.mode}`,
    {
        'is-disabled': props.disabled,
    },
])

const center = CENTER
const radius = RADIUS

const ariaLabel = computed(() => {
    if (!isGauge.value && hasRange.value) {
        return `${props.label ?? 'range'} ${normalizedRange.value.start}에서 ${normalizedRange.value.end}`
    }

    return `${props.label ?? 'progress'} ${normalizedValue.value}`
})

/* -------------------------------------------------------------------------- */
/* paths & points */
/* -------------------------------------------------------------------------- */
const trackPath = computed(() => {
    return describeArc(center.x, center.y, radius, -180, 0)
})

const valuePath = computed(() => {
    const { min, max } = bounds.value

    return describeArc(
        center.x,
        center.y,
        radius,
        -180,
        valueToAngle(normalizedValue.value, min, max),
    )
})

const rangePath = computed(() => {
    const { min, max } = bounds.value

    return describeArc(
        center.x,
        center.y,
        radius,
        valueToAngle(normalizedRange.value.start, min, max),
        valueToAngle(normalizedRange.value.end, min, max),
    )
})

const needlePoint = computed(() => {
    const { min, max } = bounds.value

    return polarToCartesian(
        center.x,
        center.y,
        radius - 6,
        valueToAngle(normalizedValue.value, min, max),
    )
})

const rangeStartPoint = computed(() => {
    const { min, max } = bounds.value

    return polarToCartesian(
        center.x,
        center.y,
        radius,
        valueToAngle(normalizedRange.value.start, min, max),
    )
})

const rangeEndPoint = computed(() => {
    const { min, max } = bounds.value

    return polarToCartesian(
        center.x,
        center.y,
        radius,
        valueToAngle(normalizedRange.value.end, min, max),
    )
})

/* -------------------------------------------------------------------------- */
/* pointer utils */
/* -------------------------------------------------------------------------- */
function getLocalPoint(event: PointerEvent) {
    const svg = svgEl.value

    if (!svg) {
        return null
    }

    const rect = svg.getBoundingClientRect()

    if (!rect.width || !rect.height) {
        return null
    }

    return {
        x: ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH,
        y: ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT,
    }
}

function pointToAngle(event: PointerEvent) {
    const point = getLocalPoint(event)

    if (!point) {
        return -180
    }

    const dx = point.x - center.x
    const dy = point.y - center.y
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI

    if (angle > 0) {
        angle = point.x < center.x ? -180 : 0
    }

    return Math.min(0, Math.max(-180, angle))
}

function angleToValue(angle: number) {
    const clampedAngle = Math.min(0, Math.max(-180, angle))
    const ratio = (clampedAngle + 180) / 180
    const { min, max, step } = bounds.value
    const rawValue = min + ratio * (max - min)

    return normalizeValue(rawValue, min, max, step)
}

function pointToValue(event: PointerEvent) {
    return angleToValue(pointToAngle(event))
}

/* -------------------------------------------------------------------------- */
/* emits */
/* -------------------------------------------------------------------------- */
function emitSingleValue(next: number) {
    const { min, max, step } = bounds.value
    const normalized = normalizeValue(next, min, max, step)

    if (normalized !== normalizedValue.value) {
        emit('update:value', normalized)
    }
}

function emitRangeValue(next: ProgressRange) {
    const { min, max, step } = bounds.value
    const normalized = normalizeRange(next, min, max, step)

    if (
        normalized.start !== normalizedRange.value.start ||
        normalized.end !== normalizedRange.value.end
    ) {
        emit('update:range', normalized)
    }
}

/* -------------------------------------------------------------------------- */
/* dragging */
/* -------------------------------------------------------------------------- */
let activeHandle: ActiveHandle = null
let isDragging = false

function updateByPointer(event: PointerEvent) {
    if (!isDragging || !activeHandle || props.disabled) {
        return
    }

    const nextValue = pointToValue(event)

    if (activeHandle === 'value') {
        emitSingleValue(nextValue)
        return
    }

    if (!hasRange.value) {
        return
    }

    const current = normalizedRange.value

    if (activeHandle === 'start') {
        emitRangeValue({
            start: nextValue,
            end: current.end,
        })
        return
    }

    emitRangeValue({
        start: current.start,
        end: nextValue,
    })
}

function onPointerMove(event: PointerEvent) {
    updateByPointer(event)
}

function stopDragging() {
    activeHandle = null
    isDragging = false

    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', stopDragging)
    window.removeEventListener('pointercancel', stopDragging)
}

function startDragging(handle: Exclude<ActiveHandle, null>, event: PointerEvent) {
    if (props.disabled) {
        return
    }

    activeHandle = handle
    isDragging = true

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    updateByPointer(event)
}

function findNearestRangeHandle(nextValue: number): 'start' | 'end' {
    const distanceToStart = Math.abs(nextValue - normalizedRange.value.start)
    const distanceToEnd = Math.abs(nextValue - normalizedRange.value.end)

    return distanceToStart <= distanceToEnd ? 'start' : 'end'
}

/* -------------------------------------------------------------------------- */
/* handlers */
/* -------------------------------------------------------------------------- */
function onTrackPointerDown(event: PointerEvent) {
    if (props.disabled || props.mode === 'display') {
        return
    }

    event.preventDefault()

    if (isControlSingle.value) {
        startDragging('value', event)
        return
    }

    if (isControlRange.value) {
        const nextValue = pointToValue(event)
        const handle = findNearestRangeHandle(nextValue)
        startDragging(handle, event)
    }
}

function onHandlePointerDown(handle: 'start' | 'end', event: PointerEvent) {
    if (!isControlRange.value || props.disabled) {
        return
    }

    event.preventDefault()
    startDragging(handle, event)
}

onBeforeUnmount(() => {
    stopDragging()
})
</script>