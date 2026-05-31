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
                        page, pageSize, total을 사용하는 기본 페이지네이션입니다.
                    </p>

                    <AppPagination v-model:page="basicPage" v-model:page-size="basicPageSize" :total="basicTotal"
                        @change="onChange('basic', $event)" />
                </section>

                <!-- PAGE SIZE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Page Size Options
                    </h2>

                    <p class="page-demo-card__desc">
                        pageSizeOptions로 페이지 크기 선택 목록을 변경합니다.
                    </p>

                    <AppPagination v-model:page="pageSizePage" v-model:page-size="pageSize" :total="pageSizeTotal"
                        :page-size-options="[5, 10, 30, 50]" @change="onChange('pageSize', $event)" />
                </section>

                <!-- SIBLING COUNT -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Sibling Count
                    </h2>

                    <p class="page-demo-card__desc">
                        현재 페이지 주변에 노출할 페이지 개수를 조절합니다.
                    </p>

                    <div class="page-demo-stack">
                        <div class="page-demo-stack">
                            <div class="page-demo-hint">siblingCount = 1</div>

                            <AppPagination v-model:page="siblingOnePage" v-model:page-size="siblingPageSize"
                                :total="siblingTotal" :sibling-count="1" :show-page-size="false"
                                @change="onChange('siblingOne', $event)" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">siblingCount = 2</div>

                            <AppPagination v-model:page="siblingTwoPage" v-model:page-size="siblingPageSize"
                                :total="siblingTotal" :sibling-count="2" :show-page-size="false"
                                @change="onChange('siblingTwo', $event)" />
                        </div>
                    </div>
                </section>

                <!-- SIZE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Size
                    </h2>

                    <p class="page-demo-card__desc">
                        sm / md 크기를 비교합니다.
                    </p>

                    <div class="page-demo-stack">
                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "sm"</div>

                            <AppPagination v-model:page="smallPage" v-model:page-size="smallPageSize"
                                :total="smallTotal" size="sm" :show-page-size="false"
                                @change="onChange('small', $event)" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "md"</div>

                            <AppPagination v-model:page="mediumPage" v-model:page-size="mediumPageSize"
                                :total="mediumTotal" size="md" :show-page-size="false"
                                @change="onChange('medium', $event)" />
                        </div>
                    </div>
                </section>

                <!-- HIDE OPTIONS -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Hide Total / Page Size
                    </h2>

                    <p class="page-demo-card__desc">
                        showTotal, showPageSize 옵션으로 보조 영역을 숨길 수 있습니다.
                    </p>

                    <AppPagination v-model:page="simplePage" v-model:page-size="simplePageSize" :total="simpleTotal"
                        :show-total="false" :show-page-size="false" @change="onChange('simple', $event)" />
                </section>

                <!-- DISABLED -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Disabled
                    </h2>

                    <p class="page-demo-card__desc">
                        disabled 상태에서는 페이지를 변경할 수 없습니다.
                    </p>

                    <AppPagination v-model:page="disabledPage" v-model:page-size="disabledPageSize"
                        :total="disabledTotal" disabled />
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
const { title, description } = useDemoI18n('pagination')

const basicPage = ref(1)
const basicPageSize = ref(10)
const basicTotal = ref(128)

const pageSizePage = ref(1)
const pageSize = ref(5)
const pageSizeTotal = ref(83)

const siblingOnePage = ref(8)
const siblingTwoPage = ref(8)
const siblingPageSize = ref(10)
const siblingTotal = ref(230)

const smallPage = ref(1)
const smallPageSize = ref(10)
const smallTotal = ref(80)

const mediumPage = ref(1)
const mediumPageSize = ref(10)
const mediumTotal = ref(80)

const simplePage = ref(3)
const simplePageSize = ref(10)
const simpleTotal = ref(95)

const disabledPage = ref(2)
const disabledPageSize = ref(10)
const disabledTotal = ref(42)

const lastChanged = ref<{
    name: string
    page: number
    pageSize: number
} | null>(null)

function onChange(name: string, payload: { page: number; pageSize: number }) {
    lastChanged.value = {
        name,
        ...payload,
    }

    console.log('pagination change', name, payload)
}

const output = computed(() =>
    JSON.stringify(
        {
            basic: {
                page: basicPage.value,
                pageSize: basicPageSize.value,
                total: basicTotal.value,
            },
            pageSize: {
                page: pageSizePage.value,
                pageSize: pageSize.value,
                total: pageSizeTotal.value,
            },
            sibling: {
                siblingOnePage: siblingOnePage.value,
                siblingTwoPage: siblingTwoPage.value,
                pageSize: siblingPageSize.value,
                total: siblingTotal.value,
            },
            size: {
                smallPage: smallPage.value,
                mediumPage: mediumPage.value,
            },
            simple: {
                page: simplePage.value,
                pageSize: simplePageSize.value,
                total: simpleTotal.value,
            },
            disabled: {
                page: disabledPage.value,
                pageSize: disabledPageSize.value,
                total: disabledTotal.value,
            },
            lastChanged: lastChanged.value,
            propsSummary: {
                page: true,
                pageSize: true,
                total: true,
                pageSizeOptions: true,
                siblingCount: true,
                showTotal: true,
                showPageSize: true,
                disabled: true,
                size: ['sm', 'md'],
            },
        },
        null,
        2,
    ),
)
</script>