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
                        기본적인 line 탭 예시입니다.
                    </p>

                    <AppTabs :items="basicItems" variant="line" v-model:active-id="basicActiveId" />
                </section>

                <!-- VARIANT -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Variant
                    </h2>

                    <p class="page-demo-card__desc">
                        line / box / pill 스타일을 비교합니다.
                    </p>

                    <div class="page-demo-stack">
                        <div class="page-demo-stack">
                            <div class="page-demo-hint">variant = "line"</div>

                            <AppTabs :items="variantItems" variant="line" v-model:active-id="lineActiveId" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">variant = "box"</div>

                            <AppTabs :items="variantItems" variant="box" v-model:active-id="boxActiveId" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">variant = "pill"</div>

                            <AppTabs :items="variantItems" variant="pill" v-model:active-id="pillActiveId" />
                        </div>
                    </div>
                </section>

                <!-- DEFAULT ACTIVE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Default Active Id
                    </h2>

                    <p class="page-demo-card__desc">
                        defaultActiveId로 특정 탭을 기본 활성 상태로 지정할 수 있습니다.
                    </p>

                    <AppTabs :items="defaultItems" variant="line" default-active-id="default-2" />
                </section>

                <!-- DISABLED -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Disabled
                    </h2>

                    <p class="page-demo-card__desc">
                        disabled 탭은 선택할 수 없습니다.
                    </p>

                    <AppTabs :items="disabledItems" variant="box" v-model:active-id="disabledActiveId" />
                </section>

                <!-- SIZE -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Size
                    </h2>

                    <p class="page-demo-card__desc">
                        sm / md / lg 크기를 비교합니다.
                    </p>

                    <div class="page-demo-stack">
                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "sm"</div>

                            <AppTabs :items="sizeItems" size="sm" variant="pill" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "md"</div>

                            <AppTabs :items="sizeItems" size="md" variant="pill" />
                        </div>

                        <div class="page-demo-stack">
                            <div class="page-demo-hint">size = "lg"</div>

                            <AppTabs :items="sizeItems" size="lg" variant="pill" />
                        </div>
                    </div>
                </section>

                <!-- VERTICAL -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Vertical
                    </h2>

                    <p class="page-demo-card__desc">
                        orientation을 vertical로 지정한 좌측 탭 예시입니다.
                    </p>

                    <AppTabs :items="verticalItems" orientation="vertical" variant="line"
                        v-model:active-id="verticalActiveId" />
                </section>

                <!-- COMPONENT RENDER -->
                <section class="page-demo-card">
                    <h2 class="page-demo-card__title">
                        Renderer / Component
                    </h2>

                    <p class="page-demo-card__desc">
                        bodyRenderer와 component 기반 렌더링을 함께 확인합니다.
                    </p>

                    <AppTabs :items="rendererItems" variant="line" v-model:active-id="rendererActiveId">
                        <template #custom="{ item }">
                            <div class="page-demo-stack">
                                <p>{{ item.title }} 슬롯 콘텐츠입니다.</p>
                                <AppButton variant="fill">
                                    Slot Button
                                </AppButton>
                            </div>
                        </template>
                    </AppTabs>
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
import { h, resolveComponent } from 'vue'
import type { AppTabItem } from '~/components/AppTabs.vue'
import ModalRendererExample from '~/pages/demos/modal/ModalRendererExample.vue'

const { title, description } = useDemoI18n('tabs')

const basicActiveId = ref<string | number | null>(null)
const lineActiveId = ref<string | number | null>(null)
const boxActiveId = ref<string | number | null>(null)
const pillActiveId = ref<string | number | null>(null)
const disabledActiveId = ref<string | number | null>(null)
const verticalActiveId = ref<string | number | null>(null)
const rendererActiveId = ref<string | number | null>(null)

const basicItems: AppTabItem[] = [
    {
        id: 'basic-1',
        title: '기본 정보',
        desc: '텍스트와 입력 필드',
        icon: 'mdi:information-outline',
        bodyRenderer: () =>
            h('div', { class: 'page-demo-stack' }, [
                h('p', '기본 탭 콘텐츠입니다.'),
                h(resolveComponent('AppInput'), {
                    modelValue: 'sample text',
                    placeholder: '입력하세요.',
                }),
            ]),
    },
    {
        id: 'basic-2',
        title: '선택 영역',
        desc: '셀렉트 컴포넌트',
        icon: 'mdi:form-select',
        bodyRenderer: () =>
            h(resolveComponent('AppSelect'), {
                modelValue: null,
                options: [
                    { label: '옵션 A', value: 'a' },
                    { label: '옵션 B', value: 'b' },
                ],
                placeholder: '선택하세요.',
            }),
    },
    {
        id: 'basic-3',
        title: '버튼 영역',
        desc: '버튼 예시',
        icon: 'mdi:gesture-tap-button',
        bodyRenderer: () =>
            h(resolveComponent('AppButton'), { variant: 'fill' }, { default: () => '확인' }),
    },
]

const variantItems: AppTabItem[] = [
    {
        id: 'variant-1',
        title: 'Account',
        badge: 3,
        bodyRenderer: () => h('div', 'Account Content'),
    },
    {
        id: 'variant-2',
        title: 'Profile',
        bodyRenderer: () => h('div', 'Profile Content'),
    },
    {
        id: 'variant-3',
        title: 'Security',
        bodyRenderer: () => h('div', 'Security Content'),
    },
]

const defaultItems: AppTabItem[] = [
    {
        id: 'default-1',
        title: 'Default 1',
        bodyRenderer: () => h('div', 'Default Content 1'),
    },
    {
        id: 'default-2',
        title: 'Default 2',
        bodyRenderer: () => h('div', 'Default Content 2'),
    },
    {
        id: 'default-3',
        title: 'Default 3',
        bodyRenderer: () => h('div', 'Default Content 3'),
    },
]

const disabledItems: AppTabItem[] = [
    {
        id: 'disabled-1',
        title: '활성 탭',
        desc: '선택할 수 있습니다.',
        bodyRenderer: () => h('div', 'Active Content'),
    },
    {
        id: 'disabled-2',
        title: '비활성 탭',
        desc: 'disabled 상태',
        disabled: true,
        bodyRenderer: () => h('div', 'Disabled Content'),
    },
    {
        id: 'disabled-3',
        title: '활성 탭 2',
        desc: '선택할 수 있습니다.',
        bodyRenderer: () => h('div', 'Active Content 2'),
    },
]

const sizeItems: AppTabItem[] = [
    {
        id: 'size-1',
        title: 'Small',
        bodyRenderer: () => h('div', 'Small Content'),
    },
    {
        id: 'size-2',
        title: 'Medium',
        bodyRenderer: () => h('div', 'Medium Content'),
    },
    {
        id: 'size-3',
        title: 'Large',
        bodyRenderer: () => h('div', 'Large Content'),
    },
]

const verticalItems: AppTabItem[] = [
    {
        id: 'vertical-1',
        title: 'Overview',
        desc: '요약 정보',
        icon: 'mdi:view-dashboard-outline',
        bodyRenderer: () => h('div', 'Overview Content'),
    },
    {
        id: 'vertical-2',
        title: 'Members',
        desc: '구성원 정보',
        icon: 'mdi:account-group-outline',
        bodyRenderer: () => h('div', 'Members Content'),
    },
    {
        id: 'vertical-3',
        title: 'Settings',
        desc: '설정 정보',
        icon: 'mdi:cog-outline',
        bodyRenderer: () => h('div', 'Settings Content'),
    },
]

const rendererItems: AppTabItem[] = [
    {
        id: 'renderer-1',
        title: 'bodyRenderer 방식',
        desc: 'render function으로 내용 생성',
        bodyRenderer: () =>
            h('div', { class: 'page-demo-stack' }, [
                h('p', '이 콘텐츠는 bodyRenderer로 렌더링됩니다.'),
                h(resolveComponent('AppProgress'), {
                    value: 65,
                    variant: 'linear',
                }),
            ]),
    },
    {
        id: 'renderer-2',
        title: 'component 방식',
        desc: 'component + componentProps 전달',
        component: ModalRendererExample,
        componentProps: {
            lastAction: 'tabs renderer',
            onAction: () => {
                console.log('tabs renderer action')
            },
        },
    },
    {
        id: 'renderer-3',
        title: 'slot 방식',
        desc: 'slot name으로 내용 연결',
        slot: 'custom',
    },
]

const output = computed(() =>
    JSON.stringify(
        {
            basicActiveId: basicActiveId.value,
            lineActiveId: lineActiveId.value,
            boxActiveId: boxActiveId.value,
            pillActiveId: pillActiveId.value,
            disabledActiveId: disabledActiveId.value,
            verticalActiveId: verticalActiveId.value,
            rendererActiveId: rendererActiveId.value,
            propsSummary: {
                activeId: true,
                defaultActiveId: true,
                initialActive: ['first', 'none'],
                variant: ['line', 'box', 'pill'],
                size: ['sm', 'md', 'lg'],
                orientation: ['horizontal', 'vertical'],
                stretch: true,
            },
        },
        null,
        2,
    ),
)
</script>