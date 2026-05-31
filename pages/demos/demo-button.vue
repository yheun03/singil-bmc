<template>
    <div class="page-demo">
        <div class="page-demo-layout">

            <main class="page-demo-main">

                <header class="page-demo__header">
                    <h1 class="page-demo__title">{{ title }}</h1>

                    <p class="page-demo__desc">{{ description }}</p>
                </header>

                <!-- -------------------------------------------------- -->
                <!-- Variant -->
                <!-- -------------------------------------------------- -->

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Variant</h2>

                    <p class="page-demo-hint">
                        버튼의 기본 스타일을 정의합니다.
                    </p>

                    <ul class="page-demo-hint-list">
                        <li><b>fill</b> : 배경 채움 버튼</li>
                        <li><b>outline</b> : 테두리 버튼</li>
                        <li><b>text</b> : 배경 없는 텍스트 버튼</li>
                        <li><b>underline</b> : 링크 스타일 버튼</li>
                    </ul>

                    <div class="page-demo-row">
                        <AppButton variant="fill" @click="log('fill')">fill</AppButton>
                        <AppButton variant="outline" @click="log('outline')">outline</AppButton>
                        <AppButton variant="text" @click="log('text')">text</AppButton>
                        <AppButton variant="underline" @click="log('underline')">underline</AppButton>
                    </div>
                </section>

                <!-- -------------------------------------------------- -->
                <!-- Size -->
                <!-- -------------------------------------------------- -->

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Size</h2>

                    <p class="page-demo-hint">
                        버튼 크기를 정의합니다.
                    </p>

                    <ul class="page-demo-hint-list">
                        <li>xs</li>
                        <li>sm</li>
                        <li>md (default)</li>
                        <li>lg</li>
                        <li>xl</li>
                    </ul>

                    <div class="page-demo-row">
                        <AppButton size="xs">XS</AppButton>
                        <AppButton size="sm">SM</AppButton>
                        <AppButton size="md">MD</AppButton>
                        <AppButton size="lg">LG</AppButton>
                        <AppButton size="xl">XL</AppButton>
                    </div>

                    <p class="page-demo-hint">
                        fill 버튼과 함께 사용
                    </p>

                    <div class="page-demo-row">
                        <AppButton variant="fill" size="xs">XS</AppButton>
                        <AppButton variant="fill" size="sm">SM</AppButton>
                        <AppButton variant="fill" size="md">MD</AppButton>
                        <AppButton variant="fill" size="lg">LG</AppButton>
                        <AppButton variant="fill" size="xl">XL</AppButton>
                    </div>

                    <p class="page-demo-hint">
                        text / underline 버튼은 typography가 별도로 적용됩니다.
                    </p>

                    <div class="page-demo-row">
                        <AppButton variant="text" size="sm">SM</AppButton>
                        <AppButton variant="text" size="md">MD</AppButton>
                        <AppButton variant="text" size="lg">LG</AppButton>
                    </div>

                    <div class="page-demo-row">
                        <AppButton variant="underline" size="sm">SM</AppButton>
                        <AppButton variant="underline" size="md">MD</AppButton>
                        <AppButton variant="underline" size="lg">LG</AppButton>
                    </div>
                </section>

                <!-- -------------------------------------------------- -->
                <!-- Shape -->
                <!-- -------------------------------------------------- -->

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Shape</h2>

                    <p class="page-demo-hint">
                        버튼 모서리 스타일
                    </p>

                    <ul class="page-demo-hint-list">
                        <li><b>square</b> : 직각</li>
                        <li><b>round</b> : 기본 (6px)</li>
                        <li><b>pill</b> : 완전 둥근 버튼</li>
                    </ul>

                    <div class="page-demo-row">
                        <AppButton variant="fill" shape="square">Square</AppButton>
                        <AppButton variant="fill" shape="round">Round</AppButton>
                        <AppButton variant="fill" shape="pill">Pill</AppButton>
                    </div>
                </section>

                <!-- -------------------------------------------------- -->
                <!-- Tone -->
                <!-- -------------------------------------------------- -->

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Tone</h2>

                    <p class="page-demo-hint">
                        버튼 색상 스타일
                    </p>

                    <ul class="page-demo-hint-list">
                        <li>primary</li>
                        <li>secondary</li>
                        <li>gray</li>
                        <li>danger</li>
                        <li>warning</li>
                        <li>success</li>
                        <li>info</li>
                    </ul>

                    <div class="page-demo-row">
                        <AppButton variant="fill" tone="primary">Primary</AppButton>
                        <AppButton variant="fill" tone="secondary">Secondary</AppButton>
                        <AppButton variant="outline" tone="gray">Gray</AppButton>
                        <AppButton variant="fill" tone="danger">Danger</AppButton>
                        <AppButton variant="fill" tone="warning">Warning</AppButton>
                        <AppButton variant="fill" tone="success">Success</AppButton>
                        <AppButton variant="fill" tone="info">Info</AppButton>
                    </div>
                </section>

                <!-- -------------------------------------------------- -->
                <!-- Icon -->
                <!-- -------------------------------------------------- -->

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Icon</h2>

                    <p class="page-demo-hint">
                        iconLeft / iconRight 슬롯을 통해 아이콘을 추가할 수 있습니다.
                    </p>

                    <div class="page-demo-row">

                        <AppButton variant="fill">
                            <template #iconLeft>
                                <Icon icon="mdi:star-outline" />
                            </template>
                            왼쪽 아이콘
                        </AppButton>

                        <AppButton variant="fill">
                            오른쪽 아이콘
                            <template #iconRight>
                                <Icon icon="mdi:star-outline" />
                            </template>
                        </AppButton>

                        <AppButton variant="text" size="custom" :custom-size="{ width: 24, height: 24 }" icon-only
                            aria-label="아이콘 버튼">
                            <template #iconLeft>
                                <Icon icon="mdi:star-outline" />
                            </template>
                        </AppButton>

                    </div>
                </section>

                <!-- -------------------------------------------------- -->
                <!-- Link -->
                <!-- -------------------------------------------------- -->

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">Link</h2>

                    <p class="page-demo-hint">
                        AppButton은 버튼 / 링크 / NuxtLink를 자동으로 처리합니다.
                    </p>

                    <ul class="page-demo-hint-list">
                        <li><b>to</b> → NuxtLink</li>
                        <li><b>href</b> → a 태그</li>
                        <li><b>newTab</b> → target="_blank"</li>
                    </ul>

                    <div class="page-demo-row">

                        <AppButton variant="text" to="/demos/demo-input">
                            내부 라우팅
                        </AppButton>

                        <AppButton variant="text" href="https://example.com" new-tab>
                            외부 링크
                        </AppButton>

                    </div>
                </section>

                <!-- -------------------------------------------------- -->
                <!-- State -->
                <!-- -------------------------------------------------- -->

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">State</h2>

                    <p class="page-demo-hint">
                        버튼 상태
                    </p>

                    <ul class="page-demo-hint-list">
                        <li><b>disabled</b> : 클릭 불가</li>
                        <li><b>loading</b> : spinner 표시</li>
                        <li><b>block</b> : width 100%</li>
                        <li><b>custom-size</b> : 사용자 정의 크기</li>
                    </ul>

                    <div class="page-demo-row">

                        <AppButton disabled>
                            Disabled
                        </AppButton>

                        <AppButton loading>
                            Loading
                        </AppButton>

                        <AppButton block>
                            Block
                        </AppButton>

                        <AppButton variant="text" size="custom" :custom-size="{ width: 40, height: 40 }"
                            aria-label="아이콘 버튼">
                            <template #iconLeft>
                                <Icon icon="mdi:star-outline" />
                            </template>
                        </AppButton>

                    </div>
                </section>

            </main>

            <!-- 로그 패널 -->

            <aside class="page-demo-aside">

                <div class="page-demo-aside__sticky">

                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">Actions</h2>

                        <div class="page-demo-actions">
                            <AppButton variant="fill" @click="clear">
                                로그 비우기
                            </AppButton>
                        </div>
                    </section>

                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">Click Log</h2>

                        <pre class="page-demo-output">
                {{ output }}
            </pre>

                    </section>

                </div>

            </aside>

        </div>
    </div>
</template>

<script setup lang="ts">
const { title, description } = useDemoI18n('button')

type LogItem = { t: number; message: string }
const logs = ref<LogItem[]>([])

function log(message: string) {
    logs.value = [{ t: Date.now(), message }, ...logs.value].slice(0, 30)
}

function clear() {
    logs.value = []
}

const output = computed(() => JSON.stringify({ count: logs.value.length, logs: logs.value }, null, 2))
</script>

<!-- demo 공통 스타일은 assets/scss/main.scss 로 이동 -->
