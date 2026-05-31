<template>
    <div class="page-demo section-demo">
        <div class="page-demo-layout">
            <main class="page-demo-main">
                <header class="page-demo__header">
                    <h1 class="page-demo__title">
                        AppSection
                    </h1>

                    <p class="page-demo__desc">
                        AppSection / AppSectionWrapper의 기본 구조와 direction, ratio, gap
                        속성을 정적으로 확인하는 데모입니다.
                    </p>
                </header>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Basic Section
                    </h2>

                    <p class="page-demo-card__desc">
                        AppSection의 기본 Header / Body / Footer 구성입니다.
                    </p>

                    <AppSection class="section-demo__section-demo" title="Account Summary" desc="기본 column, gap=12">
                        <AppSectionHeader>
                            <div class="section-demo-box section-demo-box--header">
                                <strong>Header</strong>
                                <span>사용자 요약 정보</span>
                            </div>
                        </AppSectionHeader>

                        <AppSectionBody>
                            <div class="section-demo-box section-demo-box--body">
                                <strong>Body</strong>
                                <span>기본 콘텐츠 영역</span>
                            </div>
                        </AppSectionBody>

                        <AppSectionFooter>
                            <div class="section-demo-box section-demo-box--footer">
                                <strong>Footer</strong>
                                <span>액션 버튼 / 안내 문구</span>
                            </div>
                        </AppSectionFooter>
                    </AppSection>
                </section>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Wrapper Column
                    </h2>

                    <p class="page-demo-card__desc">
                        AppSectionWrapper 세로 배치 예시입니다.
                    </p>

                    <AppSectionWrapper class="section-demo__wrapper-demo" title="Project Status"
                        desc="direction='column' / gap='24'" direction="column" :gap="24">
                        <template #header>
                            <div class="section-demo-box section-demo-box--wrapper-header">
                                <strong>Wrapper Header</strong>
                                <span>프로젝트 상태 요약 영역</span>
                            </div>
                        </template>

                        <AppSection class="section-demo__section-demo" title="Overview" desc="첫 번째 섹션" :gap="12">
                            <AppSectionBody>
                                <div class="section-demo-box section-demo-box--body">
                                    <strong>Body</strong>
                                    <span>진행률 / 핵심 지표</span>
                                </div>
                            </AppSectionBody>
                        </AppSection>

                        <AppSection class="section-demo__section-demo" title="Issues" desc="두 번째 섹션" :gap="12">
                            <AppSectionBody>
                                <div class="section-demo-box section-demo-box--body">
                                    <strong>Body</strong>
                                    <span>이슈 목록 / 우선순위</span>
                                </div>
                            </AppSectionBody>
                        </AppSection>
                    </AppSectionWrapper>
                </section>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Wrapper Row + Ratio
                    </h2>

                    <p class="page-demo-card__desc">
                        AppSectionWrapper 가로 배치와 ratio, gap 조합 예시입니다.
                    </p>

                    <AppSectionWrapper class="section-demo__wrapper-demo" title="Dashboard Layout"
                        desc="direction='row' / ratio='2fr 1fr' / gap='20'" direction="row" :ratio="[2, 1]" :gap="20">
                        <template #header>
                            <div class="section-demo-box section-demo-box--wrapper-header">
                                <strong>Wrapper Header</strong>
                                <span>메인 + 사이드 패널 레이아웃</span>
                            </div>
                        </template>

                        <AppSection class="section-demo__section-demo" title="Main Panel" desc="ratio 2" :gap="10">
                            <AppSectionBody>
                                <div class="section-demo-box section-demo-box--body">
                                    <strong>2fr</strong>
                                    <span>메인 콘텐츠 영역</span>
                                </div>
                            </AppSectionBody>
                        </AppSection>

                        <AppSection class="section-demo__section-demo" title="Side Panel" desc="ratio 1" :gap="10">
                            <AppSectionBody>
                                <div class="section-demo-box section-demo-box--body">
                                    <strong>1fr</strong>
                                    <span>보조 정보 영역</span>
                                </div>
                            </AppSectionBody>
                        </AppSection>
                    </AppSectionWrapper>
                </section>

                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Section Row + Repeat
                    </h2>

                    <p class="page-demo-card__desc">
                        AppSection 내부 row 배치와 반복 렌더링을 함께 확인합니다.
                    </p>

                    <AppSectionWrapper class="section-demo__wrapper-demo" title="Weekly Tasks" desc="반복 section 예시"
                        direction="column" :gap="16">
                        <AppSection v-for="item in repeatedSections" :key="item.id" class="section-demo__section-demo"
                            :title="item.title" :desc="item.desc" direction="row" :ratio="[1, 1]" :gap="8">
                            <AppSectionBody>
                                <div class="section-demo-box section-demo-box--body">
                                    <strong>{{ item.label }}</strong>
                                    <span>{{ item.note }}</span>
                                </div>
                            </AppSectionBody>

                            <AppSectionBody>
                                <div class="section-demo-box section-demo-box--body">
                                    <strong>Detail</strong>
                                    <span>추가 설명 영역</span>
                                </div>
                            </AppSectionBody>
                        </AppSection>
                    </AppSectionWrapper>
                </section>
            </main>

            <aside class="page-demo-aside" aria-label="현재 값 패널">
                <div class="page-demo-aside__sticky">
                    <section class="page-demo-card">
                        <h2 class="page-demo-card__title">
                            Structure Info
                        </h2>

                        <pre class="page-demo-output">{{ output }}</pre>
                    </section>
                </div>
            </aside>
        </div>
    </div>
</template>

<script setup lang="ts">
const repeatedSections = ref([
    {
        id: 1,
        title: 'Section Item 1',
        desc: '첫 번째 반복 섹션',
        label: 'Body 1',
        note: 'v-for item #1',
    },
    {
        id: 2,
        title: 'Section Item 2',
        desc: '두 번째 반복 섹션',
        label: 'Body 2',
        note: 'v-for item #2',
    },
    {
        id: 3,
        title: 'Section Item 3',
        desc: '세 번째 반복 섹션',
        label: 'Body 3',
        note: 'v-for item #3',
    },
])

const output = computed(() =>
    JSON.stringify(
        {
            examples: {
                wrapper: {
                    column: {
                        direction: 'column',
                        ratio: 'auto',
                        gap: '24px',
                    },
                    row: {
                        direction: 'row',
                        ratio: '2fr 1fr',
                        gap: '20px',
                    },
                },
                section: {
                    column: {
                        direction: 'column',
                        ratio: 'auto',
                        gap: '12px',
                    },
                    row: {
                        direction: 'row',
                        ratio: '1fr 1fr',
                        gap: '8px',
                    },
                },
            },
            repeat: {
                count: repeatedSections.value.length,
                sameProps: true,
            },
        },
        null,
        2,
    ),
)
</script>

<style lang="scss" scoped>
.section-demo {
    &__wrapper-demo {
        padding: 16px;
        border: 1px solid rgba(168, 85, 247, 0.24);
        border-radius: 20px;
        background: rgba(168, 85, 247, 0.08);
    }

    &__section-demo {
        border-color: rgba(239, 68, 68, 0.22);
        background: rgba(239, 68, 68, 0.08);
    }
}

.section-demo-box {
    display: grid;
    gap: 6px;
    min-height: 88px;
    padding: 16px;
    border-radius: 12px;
    border: 1px dashed rgba(15, 23, 42, 0.14);

    strong {
        font-weight: 700;
        color: #0f172a;
    }

    span {
        font-size: 14px;
        color: #475569;
    }

    &--wrapper-header {
        background: rgba(126, 34, 206, 0.14);
    }

    &--header {
        background: rgba(59, 130, 246, 0.14);
    }

    &--body {
        background: rgba(34, 197, 94, 0.14);
    }

    &--footer {
        background: rgba(249, 115, 22, 0.14);
    }
}
</style>
