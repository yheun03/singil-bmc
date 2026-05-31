<template>
    <div class="page-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">

                <!-- HEADER -->
                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>

                    <p class="page-demo__desc">{{ description }}</p>
                </header>

                <!-- BASIC -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Basic
                    </h2>

                    <p class="page-demo-card__desc">
                        가장 기본적인 DatePicker 사용 예시입니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppDatePicker v-model="basic.single" label="단일 날짜" placeholder="날짜를 선택하세요"
                            hint="기본 single 모드입니다">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="basic.range" mode="range" label="범위 날짜" placeholder="기간을 선택하세요"
                            hint="시작일과 종료일을 선택합니다">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="basic.multiple" mode="multiple" label="다중 날짜" placeholder="여러 날짜를 선택하세요"
                            hint="복수 날짜 선택이 가능합니다">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                    </div>
                </section>

                <!-- MODE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Mode
                    </h2>

                    <p class="page-demo-card__desc">
                        single / range / multiple 모드를 제어합니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppDatePicker v-model="modes.single" mode="single" label="Single" hint="하나의 날짜 선택">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="modes.range" mode="range" label="Range" hint="날짜 범위 선택">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="modes.multiple" mode="multiple" label="Multiple" hint="여러 날짜 선택">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                    </div>
                </section>

                <!-- SIZE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Size
                    </h2>

                    <p class="page-demo-card__desc">
                        DatePicker의 높이를 제어합니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppDatePicker v-model="sizes.xs" size="xs" label="XS">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="sizes.sm" size="sm" label="SM">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="sizes.md" size="md" label="MD">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="sizes.lg" size="lg" label="LG">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                    </div>
                </section>

                <!-- SHAPE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Shape
                    </h2>

                    <p class="page-demo-card__desc">
                        DatePicker의 border 스타일을 제어합니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppDatePicker v-model="shapes.square" shape="square" label="Square">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="shapes.round" shape="round" label="Round">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="shapes.pill" shape="pill" label="Pill">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="shapes.underline" shape="underline" label="Underline">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                    </div>
                </section>

                <!-- STATE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        State
                    </h2>

                    <p class="page-demo-card__desc">
                        입력 상태에 따른 스타일을 제공합니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppDatePicker v-model="states.error" label="Error" state="error" hint="에러 메시지">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="states.warning" label="Warning" state="warning" hint="경고 메시지">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="states.success" label="Success" state="success" hint="선택 가능">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                    </div>
                </section>

                <!-- DISABLED & READONLY -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Disabled &amp; Readonly
                    </h2>

                    <p class="page-demo-card__desc">
                        선택 불가 또는 읽기 전용 상태를 제어합니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppDatePicker v-model="disabledValue" label="Disabled" disabled hint="비활성 상태">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                        <AppDatePicker v-model="readonlyValue" label="Readonly" readonly hint="읽기 전용 상태">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                    </div>
                </section>

                <!-- CONSTRAINTS -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Constraints
                    </h2>

                    <p class="page-demo-card__desc">
                        min / max 속성으로 선택 가능한 날짜 범위를 제한합니다.
                    </p>

                    <div class="page-demo-grid">
                        <AppDatePicker v-model="constraints.single" label="Min / Max" :min="min" :max="max"
                            hint="2026년 내에서만 선택 가능">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>

                        <AppDatePicker v-model="constraints.range" mode="range" label="Range with Min / Max" :min="min"
                            :max="max" hint="범위 선택에도 동일하게 적용">
                            <template #iconRight>
                                <Icon icon="mdi:calendar-month-outline" />
                            </template>
                        </AppDatePicker>
                    </div>
                </section>

            </main>

            <!-- STATE PANEL -->
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
import { Icon } from '@iconify/vue'
import type { DateRangeValue } from '~/components/AppDatePicker.vue'

const { title, description } = useDemoI18n('datepicker')

const min = '2026-04-01'
const max = '2026-12-31'

const basic = reactive({
    single: null as string | null,
    range: null as DateRangeValue | null,
    multiple: [] as string[],
})

const modes = reactive({
    single: null as string | null,
    range: null as DateRangeValue | null,
    multiple: [] as string[],
})

const sizes = reactive({
    xs: null as string | null,
    sm: null as string | null,
    md: null as string | null,
    lg: null as string | null,
})

const shapes = reactive({
    square: null as string | null,
    round: null as string | null,
    pill: null as string | null,
    underline: null as string | null,
})

const states = reactive({
    error: null as string | null,
    warning: null as string | null,
    success: null as string | null,
})

const disabledValue = ref<string | null>('2026-05-10')
const readonlyValue = ref<string | null>('2026-05-10')

const constraints = reactive({
    single: null as string | null,
    range: null as DateRangeValue | null,
})

const output = computed(() =>
    JSON.stringify(
        {
            basic,
            modes,
            sizes,
            shapes,
            states,
            disabledValue: disabledValue.value,
            constraints,
            min,
            max,
        },
        null,
        2,
    ),
)
</script>

<!-- demo 공통 스타일은 assets/scss/main.scss 로 이동 -->