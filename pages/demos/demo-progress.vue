<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">

                <!-- HEADER -->
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>

                    <p class="page-demo__desc">{{ description }}</p>
                </header>

                <!-- LINEAR DISPLAY -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Linear Display
                    </h2>

                    <p class="page-demo-card__desc">
                        선형 프로그레스의 기본 표시 예시입니다.
                    </p>

                    <div class="page-demo-stack">
                        <AppProgress :value="linearDisplayValue" variant="linear" />

                        <AppProgress :value="linearRangeDisplay.end" :range="linearRangeDisplay" variant="linear" />

                        <div class="page-demo-hint">
                            {{ linearRangeDisplay.start }}% ~ {{ linearRangeDisplay.end }}%
                        </div>
                    </div>
                </section>

                <!-- LINEAR DRAG -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Linear Drag Control
                    </h2>

                    <p class="page-demo-card__desc">
                        드래그로 단일 값과 범위를 조정할 수 있습니다.
                    </p>

                    <div class="page-demo-stack">
                        <AppProgress v-model:value="linearControlValue" variant="linear" mode="control-single"
                            label="단일 값" :show-label="true" />

                        <AppProgress :value="linearControlRange.end" :range="linearControlRange" variant="linear"
                            mode="control-range" @update:range="onUpdateLinearRange" />

                        <div class="page-demo-hint">
                            {{ linearControlRange.start }}% ~ {{ linearControlRange.end }}%
                        </div>
                    </div>
                </section>

                <!-- GAUGE DISPLAY -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Gauge Display
                    </h2>

                    <p class="page-demo-card__desc">
                        반원 게이지와 반도넛 범위의 기본 표시 예시입니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppProgressGauge :value="gaugeDisplayValue" type="gauge" label="속도" />

                        <AppProgressGauge :range="gaugeRangeDisplay" type="semi-doughnut-range" label="권장 범위" />
                    </div>
                </section>

                <!-- GAUGE DRAG -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Gauge Drag Control
                    </h2>

                    <p class="page-demo-card__desc">
                        드래그로 게이지 값과 반도넛 범위를 조정할 수 있습니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppProgressGauge v-model:value="gaugeControlValue" type="gauge" mode="control-single"
                            label="속도" />

                        <AppProgressGauge :range="gaugeControlRange" type="semi-doughnut-range" mode="control-range"
                            label="권장 범위" @update:range="onUpdateGaugeRange" />
                    </div>
                </section>

                <!-- DISABLED -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Disabled
                    </h2>

                    <p class="page-demo-card__desc">
                        비활성 상태를 확인합니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppProgress :value="disabledLinearValue" variant="linear" mode="control-single"
                            label="Disabled Linear" :show-label="true" disabled />

                        <AppProgressGauge :value="disabledGaugeValue" type="gauge" mode="control-single"
                            label="Disabled Gauge" disabled />
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
const { title, description } = useDemoI18n('progress')

const linearDisplayValue = 35

const linearRangeDisplay = reactive({
    start: 20,
    end: 70,
})

const linearControlValue = ref(42)

const linearControlRange = reactive({
    start: 25,
    end: 75,
})

const gaugeDisplayValue = 68

const gaugeRangeDisplay = reactive({
    start: 20,
    end: 70,
})

const gaugeControlValue = ref(68)

const gaugeControlRange = reactive({
    start: 20,
    end: 70,
})

const disabledLinearValue = 40
const disabledGaugeValue = 55

function onUpdateLinearRange(value: { start: number; end: number }) {
    linearControlRange.start = value.start
    linearControlRange.end = value.end
}

function onUpdateGaugeRange(value: { start: number; end: number }) {
    gaugeControlRange.start = value.start
    gaugeControlRange.end = value.end
}

const output = computed(() =>
    JSON.stringify(
        {
            linearDisplayValue,
            linearRangeDisplay: {
                start: linearRangeDisplay.start,
                end: linearRangeDisplay.end,
            },
            linearControlValue: linearControlValue.value,
            linearControlRange: {
                start: linearControlRange.start,
                end: linearControlRange.end,
            },
            gaugeDisplayValue,
            gaugeRangeDisplay: {
                start: gaugeRangeDisplay.start,
                end: gaugeRangeDisplay.end,
            },
            gaugeControlValue: gaugeControlValue.value,
            gaugeControlRange: {
                start: gaugeControlRange.start,
                end: gaugeControlRange.end,
            },
            disabledLinearValue,
            disabledGaugeValue,
        },
        null,
        2,
    ),
)
</script>

<!-- demo 공통 스타일은 assets/scss/main.scss 로 이동 -->