<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>

                    <p class="page-demo__desc">{{ description }}</p>
                </header>

                <!-- LINE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Line Variants
                    </h2>

                    <p class="page-demo-card__desc">
                        기본 라인, 스텝 라인, 멀티 라인 구성을 확인합니다.
                    </p>

                    <div class="page-demo-grid">
                        <client-only>
                            <AppChart class="page-demo-chart-box" type="line" :data="lineData" />
                        </client-only>

                        <client-only>
                            <AppChart class="page-demo-chart-box" type="line" :data="steppedLineData" />
                        </client-only>

                        <client-only>
                            <AppChart class="page-demo-chart-box" type="line" :data="multiLineData" />
                        </client-only>

                        <client-only>
                            <AppChart class="page-demo-chart-box" type="line" :data="multiLineData2" />
                        </client-only>
                    </div>
                </section>

                <!-- CHART TYPES -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Bar / Doughnut / Semi Doughnut / Pie
                    </h2>

                    <p class="page-demo-card__desc">
                        막대형, 도넛형, 반도넛형, 원형 차트 구성을 확인합니다.
                    </p>

                    <div class="page-demo-grid">
                        <client-only>
                            <AppChart class="page-demo-chart-box" type="bar" :data="barData" />
                        </client-only>

                        <client-only>
                            <AppChart class="page-demo-chart-box" type="doughnut" :data="doughnutData" :height="220" />
                        </client-only>

                        <client-only>
                            <AppChart class="page-demo-chart-box" type="doughnut" variant="semi-doughnut"
                                :data="semiDoughnutData" :height="220" />
                        </client-only>

                        <client-only>
                            <AppChart class="page-demo-chart-box" type="pie" :data="pieData" :height="220" />
                        </client-only>
                    </div>
                </section>
            </main>

            <aside class="page-demo-aside" aria-label="현재 값 패널">
                <div class="page-demo-aside__sticky">
                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">
                            Current Value
                        </h2>

                        <pre class="page-demo-output">{{ output }}</pre>
                    </section>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ChartData } from 'chart.js'

const { title, description } = useDemoI18n('chart')

const lineLabels = ['1월', '2월', '3월', '4월', '5월', '6월']
const pieLabels = ['A', 'B', 'C', 'D']

const lineData = computed<ChartData<'line'>>(() => ({
    labels: lineLabels,
    datasets: [
        {
            label: 'Line',
            data: [35, 52, 41, 68, 57, 74],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
        },
    ],
}))

const steppedLineData = computed<ChartData<'line'>>(() => ({
    labels: lineLabels,
    datasets: [
        {
            label: 'Stepped',
            data: [28, 46, 39, 63, 55, 71],
            borderColor: '#14b8a6',
            backgroundColor: 'rgba(20, 184, 166, 0.15)',
            fill: true,
            tension: 0,
            stepped: true,
            pointRadius: 3,
        },
    ],
}))

const multiLineData = computed<ChartData<'line'>>(() => ({
    labels: lineLabels,
    datasets: [
        {
            label: 'Series A',
            data: [32, 48, 44, 62, 58, 76],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
        },
        {
            label: 'Series B',
            data: [25, 39, 51, 57, 49, 68],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
        },
    ],
}))

const multiLineData2 = computed<ChartData<'line'>>(() => ({
    labels: lineLabels,
    datasets: [
        {
            label: 'Series A',
            data: [30, 45, 40, 58, 52, 70],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            fill: false,
            tension: 0.35,
            pointRadius: 3,
        },
        {
            label: 'Series B',
            data: [22, 36, 34, 49, 46, 61],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            fill: false,
            tension: 0.35,
            pointRadius: 3,
        },
        {
            label: 'Series C',
            data: [38, 53, 49, 66, 60, 78],
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.08)',
            fill: false,
            tension: 0.35,
            pointRadius: 3,
        },
    ],
}))

const barData = computed<ChartData<'bar'>>(() => ({
    labels: lineLabels,
    datasets: [
        {
            label: 'Bar',
            data: [45, 62, 38, 74, 59, 81],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderRadius: 8,
        },
    ],
}))

const doughnutData = computed<ChartData<'doughnut'>>(() => ({
    labels: pieLabels,
    datasets: [
        {
            label: 'Doughnut',
            data: [35, 25, 20, 20],
            backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#e11d48'],
            borderWidth: 0,
        },
    ],
}))

const semiDoughnutData = computed<ChartData<'doughnut'>>(() => ({
    labels: ['정상', '지연', '대기', '점검'],
    datasets: [
        {
            data: [45, 25, 15, 15],
            backgroundColor: ['#00626F', '#2687D8', '#32C771', '#FFAA00'],
            borderWidth: 0,
        },
    ],
}))

const pieData = computed<ChartData<'pie'>>(() => ({
    labels: pieLabels,
    datasets: [
        {
            label: 'Pie',
            data: [30, 22, 18, 30],
            backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#e11d48'],
            borderWidth: 0,
        },
    ],
}))

const output = computed(() =>
    JSON.stringify(
        {
            lineData: lineData.value,
            steppedLineData: steppedLineData.value,
            multiLineData: multiLineData.value,
            multiLineData2: multiLineData2.value,
            barData: barData.value,
            doughnutData: doughnutData.value,
            semiDoughnutData: semiDoughnutData.value,
            pieData: pieData.value,
        },
        null,
        2,
    ),
)
</script>

<!-- demo 공통 스타일은 assets/scss/main.scss 로 이동 -->