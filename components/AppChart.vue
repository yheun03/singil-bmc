<template>
    <ClientOnly>
        <div class="app-chart" :class="wrapperClasses" :style="{ height: `${resolvedHeight}px` }">
            <Line v-if="isLine" class="app-chart__canvas" :data="lineData" :options="lineOptions" />

            <Bar v-else-if="isBar" class="app-chart__canvas" :data="barData" :options="barOptions" />

            <Doughnut v-else-if="isDoughnut" class="app-chart__canvas" :data="doughnutData"
                :options="doughnutOptions" />

            <Pie v-else class="app-chart__canvas" :data="pieData" :options="pieOptions" />
        </div>

        <template #fallback>
            <div class="app-chart__fallback" :style="{ height: `${resolvedHeight}px` }">
                차트 로딩 중...
            </div>
        </template>
    </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar, Line, Doughnut, Pie } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartData,
    type ChartOptions,
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
)

type ChartType = 'line' | 'bar' | 'doughnut' | 'pie'
type ChartVariant = 'default' | 'semi-doughnut'

type AnyObject = Record<string, any>

const props = withDefaults(
    defineProps<{
        type: ChartType
        data: ChartData<ChartType>
        height?: number
        variant?: ChartVariant
        cutout?: string | number
        options?: AnyObject
    }>(),
    {
        height: 260,
        variant: 'default',
        cutout: '68%',
        options: () => ({}),
    },
)

function isObject(value: unknown): value is AnyObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function deepMerge<T extends AnyObject>(...sources: T[]): T {
    const result: AnyObject = {}

    for (const source of sources) {
        if (!isObject(source)) continue

        for (const key of Object.keys(source)) {
            const prev = result[key]
            const next = source[key]

            if (Array.isArray(next)) {
                result[key] = next.slice()
                continue
            }

            if (isObject(prev) && isObject(next)) {
                result[key] = deepMerge(prev, next)
                continue
            }

            result[key] = next
        }
    }

    return result as T
}

const resolvedType = computed<ChartType>(() => {
    return props.variant === 'semi-doughnut' ? 'doughnut' : props.type
})

const isLine = computed(() => resolvedType.value === 'line')
const isBar = computed(() => resolvedType.value === 'bar')
const isDoughnut = computed(() => resolvedType.value === 'doughnut')

const resolvedHeight = computed(() => {
    if (props.variant === 'semi-doughnut') {
        return Math.max(220, Math.floor(Number(props.height) || 260))
    }

    return Math.max(120, Math.floor(Number(props.height) || 260))
})

const wrapperClasses = computed(() => ({
    'app-chart--semi-doughnut': props.variant === 'semi-doughnut',
}))

const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
        legend: {
            display: true,
        },
        tooltip: {
            enabled: true,
        },
    },
} satisfies AnyObject

const defaultLineOptions = {
    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            beginAtZero: true,
            suggestedMax: 100,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
        },
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
    },
} satisfies AnyObject

const defaultBarOptions = {
    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            beginAtZero: true,
            suggestedMax: 100,
            grid: {
                color: 'rgba(0, 0, 0, 0.05)',
            },
        },
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
    },
} satisfies AnyObject

const defaultDoughnutOptions = {
    cutout: props.cutout,
    plugins: {
        legend: {
            position: 'bottom',
            align: 'center',
            labels: {
                boxWidth: 14,
                boxHeight: 14,
                padding: 12,
                usePointStyle: false,
            },
        },
    },
} satisfies AnyObject

const defaultSemiDoughnutOptions = {
    rotation: -90,
    circumference: 180,
    cutout: props.cutout,
    layout: {
        padding: {
            top: 16,
            right: 16,
            bottom: 0,
            left: 16,
        },
    },
    plugins: {
        legend: {
            position: 'bottom',
            align: 'center',
            labels: {
                boxWidth: 14,
                boxHeight: 14,
                padding: 12,
                usePointStyle: false,
            },
        },
    },
} satisfies AnyObject

const defaultPieOptions = {
    plugins: {
        legend: {
            position: 'bottom',
            align: 'center',
            labels: {
                boxWidth: 14,
                boxHeight: 14,
                padding: 12,
                usePointStyle: false,
            },
        },
    },
} satisfies AnyObject

const chartData = computed(() => {
    if (props.variant !== 'semi-doughnut') {
        return props.data
    }

    return {
        ...props.data,
        datasets: (props.data.datasets ?? []).map((dataset: any) => ({
            ...dataset,
            borderWidth: dataset.borderWidth ?? 0,
            cutout: dataset.cutout ?? props.cutout,
        })),
    } as ChartData<'doughnut'>
})

const lineData = computed(() => props.data as ChartData<'line'>)
const barData = computed(() => props.data as ChartData<'bar'>)
const doughnutData = computed(() => chartData.value as ChartData<'doughnut'>)
const pieData = computed(() => props.data as ChartData<'pie'>)

const lineOptions = computed<ChartOptions<'line'>>(() => {
    return deepMerge(
        baseOptions,
        defaultLineOptions,
        props.options,
    ) as ChartOptions<'line'>
})

const barOptions = computed<ChartOptions<'bar'>>(() => {
    return deepMerge(
        baseOptions,
        defaultBarOptions,
        props.options,
    ) as ChartOptions<'bar'>
})

const doughnutOptions = computed<ChartOptions<'doughnut'>>(() => {
    const preset = props.variant === 'semi-doughnut'
        ? defaultSemiDoughnutOptions
        : defaultDoughnutOptions

    return deepMerge(
        baseOptions,
        preset,
        props.options,
    ) as ChartOptions<'doughnut'>
})

const pieOptions = computed<ChartOptions<'pie'>>(() => {
    return deepMerge(
        baseOptions,
        defaultPieOptions,
        props.options,
    ) as ChartOptions<'pie'>
})
</script>