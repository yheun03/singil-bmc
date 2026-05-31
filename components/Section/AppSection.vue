<template>
    <section class="app-section" :class="sectionClassName" :style="sectionStyle">
        <header v-if="hasDefaultHeader" class="app-section__header">
            <div class="app-section__header-text">
                <h3 v-if="title" class="app-section__title">
                    {{ title }}
                </h3>

                <p v-if="desc" class="app-section__desc">
                    {{ desc }}
                </p>
            </div>
        </header>

        <div class="app-section__content">
            <slot />
        </div>
    </section>
</template>

<script setup lang="ts">
type SectionDirection = 'row' | 'column'
type SectionRatio = number[] | string | null
type SectionGap = number | string

const props = withDefaults(
    defineProps<{
        direction?: SectionDirection
        ratio?: SectionRatio
        title?: string
        desc?: string
        gap?: number | string
    }>(),
    {
        direction: 'column',
        ratio: null,
        title: '',
        desc: '',
        gap: 12,
    },
)

function normalizeGap(value: number | string) {
    return typeof value === 'number' ? `${value}px` : value
}

function normalizeRatio(value: SectionRatio) {
    if (!value) return undefined

    if (Array.isArray(value)) {
        return value.map((item) => `${item}fr`).join(' ')
    }

    return value
}

const hasDefaultHeader = computed(() => !!props.title || !!props.desc)

const sectionClassName = computed(() => `app-section--${props.direction}`)

const sectionStyle = computed(() => {
    return {
        '--app-section-gap': normalizeGap(props.gap as SectionGap),
        '--app-section-template': normalizeRatio(props.ratio),
    }
})
</script>