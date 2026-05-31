<template>
    <div class="app-tabs" :class="[
        `app-tabs--${variant}`,
        `app-tabs--${size}`,
        `app-tabs--${orientation}`,
        {
            'is-stretch': stretch,
        },
    ]">
        <div ref="tabListRef" class="app-tabs__list" role="tablist" :aria-orientation="orientation">
            <button v-for="(item, index) in enabledAwareItems" :id="getTabId(item.id)" :key="item.id"
                ref="tabButtonRefs" type="button" class="app-tabs__tab" role="tab" :class="{
                    'is-active': isActive(item.id),
                    'is-disabled': item.disabled,
                }" :disabled="item.disabled" :aria-selected="isActive(item.id)" :aria-controls="getPanelId(item.id)"
                :tabindex="isActive(item.id) ? 0 : -1" @click="selectItem(item.id)"
                @keydown="onTabKeydown($event, index)">
                <span v-if="item.icon" class="app-tabs__tab-icon" aria-hidden="true">
                    <Icon :icon="item.icon" />
                </span>

                <span class="app-tabs__tab-text">
                    <strong class="app-tabs__tab-title">
                        {{ item.title }}
                    </strong>

                    <span v-if="item.desc" class="app-tabs__tab-desc">
                        {{ item.desc }}
                    </span>
                </span>

                <span v-if="item.badge" class="app-tabs__tab-badge">
                    {{ item.badge }}
                </span>
            </button>
        </div>

        <div class="app-tabs__panels">
            <div v-for="item in normalizedItems" v-show="isActive(item.id)" :id="getPanelId(item.id)" :key="item.id"
                class="app-tabs__panel" role="tabpanel" :aria-labelledby="getTabId(item.id)" :tabindex="0">
                <component :is="getRendererComponent(item)" v-if="getRendererComponent(item)" />

                <slot v-else-if="item.slot" :name="item.slot" :item="item" />

                <div v-else class="app-tabs__empty">
                    내용이 없습니다.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { Component, VNodeChild } from 'vue'

type TabRenderer = () => VNodeChild
type TabInitialActive = 'first' | 'none'
type TabVariant = 'line' | 'box' | 'pill'
type TabSize = 'sm' | 'md' | 'lg'
type TabOrientation = 'horizontal' | 'vertical'

export type AppTabItem = {
    id: string | number
    title: string
    desc?: string
    icon?: string
    badge?: string | number
    disabled?: boolean
    slot?: string
    bodyRenderer?: TabRenderer
    component?: Component
    componentProps?: Record<string, unknown>
}

const props = withDefaults(
    defineProps<{
        items: AppTabItem[]
        activeId?: string | number | null
        defaultActiveId?: string | number | null
        initialActive?: TabInitialActive
        variant?: TabVariant
        size?: TabSize
        orientation?: TabOrientation
        stretch?: boolean
    }>(),
    {
        activeId: undefined,
        defaultActiveId: undefined,
        initialActive: 'first',
        variant: 'line',
        size: 'md',
        orientation: 'horizontal',
        stretch: false,
    },
)

const emit = defineEmits<{
    (e: 'update:activeId', value: string | number | null): void
    (e: 'change', payload: { id: string | number | null; item: AppTabItem | null }): void
}>()

const tabListRef = ref<HTMLElement | null>(null)
const tabButtonRefs = ref<HTMLButtonElement[]>([])

const normalizedItems = computed(() => props.items ?? [])

const enabledAwareItems = computed(() => normalizedItems.value)

const enabledItems = computed(() =>
    normalizedItems.value.filter((item) => !item.disabled),
)

const isControlled = computed(() => props.activeId !== undefined)

function getInitialActiveId() {
    if (props.defaultActiveId !== undefined && props.defaultActiveId !== null) {
        const matchedDefaultItem = normalizedItems.value.find(
            (item) => item.id === props.defaultActiveId && !item.disabled,
        )

        return matchedDefaultItem ? matchedDefaultItem.id : null
    }

    if (props.initialActive === 'first') {
        return enabledItems.value[0]?.id ?? null
    }

    return null
}

const internalActiveId = ref<string | number | null>(getInitialActiveId())

watch(
    () => [props.items, props.defaultActiveId, props.initialActive],
    () => {
        if (isControlled.value) return

        const currentItem = normalizedItems.value.find(
            (item) => item.id === internalActiveId.value && !item.disabled,
        )

        if (currentItem) return

        internalActiveId.value = getInitialActiveId()
    },
    { deep: true },
)

const currentActiveId = computed(() => {
    return isControlled.value ? props.activeId ?? null : internalActiveId.value
})

function setActiveId(next: string | number | null) {
    if (!isControlled.value) {
        internalActiveId.value = next
    }

    emit('update:activeId', next)

    const item = normalizedItems.value.find((tabItem) => tabItem.id === next) ?? null

    emit('change', {
        id: next,
        item,
    })
}

function isActive(id: string | number) {
    return currentActiveId.value === id
}

function selectItem(id: string | number) {
    const target = normalizedItems.value.find((item) => item.id === id)

    if (!target || target.disabled) return
    if (currentActiveId.value === id) return

    setActiveId(id)
}

function getTabId(id: string | number) {
    return `app-tabs-tab-${id}`
}

function getPanelId(id: string | number) {
    return `app-tabs-panel-${id}`
}

function focusTabByIndex(index: number) {
    const target = tabButtonRefs.value[index]

    if (!target || target.disabled) return

    target.focus()
}

function findNextEnabledIndex(currentIndex: number, direction: 1 | -1) {
    if (!normalizedItems.value.length) return -1

    let nextIndex = currentIndex

    for (let count = 0; count < normalizedItems.value.length; count += 1) {
        nextIndex =
            (nextIndex + direction + normalizedItems.value.length) %
            normalizedItems.value.length

        const nextItem = normalizedItems.value[nextIndex]

        if (nextItem && !nextItem.disabled) {
            return nextIndex
        }
    }

    return -1
}

function selectByIndex(index: number) {
    const target = normalizedItems.value[index]

    if (!target || target.disabled) return

    selectItem(target.id)
    focusTabByIndex(index)
}

function onTabKeydown(event: KeyboardEvent, index: number) {
    const isHorizontal = props.orientation === 'horizontal'

    const nextKeys = isHorizontal ? ['ArrowRight'] : ['ArrowDown']
    const prevKeys = isHorizontal ? ['ArrowLeft'] : ['ArrowUp']

    if (nextKeys.includes(event.key)) {
        event.preventDefault()

        const nextIndex = findNextEnabledIndex(index, 1)

        if (nextIndex >= 0) {
            selectByIndex(nextIndex)
        }

        return
    }

    if (prevKeys.includes(event.key)) {
        event.preventDefault()

        const prevIndex = findNextEnabledIndex(index, -1)

        if (prevIndex >= 0) {
            selectByIndex(prevIndex)
        }

        return
    }

    if (event.key === 'Home') {
        event.preventDefault()

        const firstIndex = normalizedItems.value.findIndex((item) => !item.disabled)

        if (firstIndex >= 0) {
            selectByIndex(firstIndex)
        }

        return
    }

    if (event.key === 'End') {
        event.preventDefault()

        const reversedIndex = [...normalizedItems.value]
            .reverse()
            .findIndex((item) => !item.disabled)

        if (reversedIndex >= 0) {
            const lastIndex = normalizedItems.value.length - 1 - reversedIndex

            selectByIndex(lastIndex)
        }
    }
}

function getRendererComponent(item: AppTabItem) {
    if (item.component) {
        return {
            render() {
                return h(item.component as Component, item.componentProps ?? {})
            },
        }
    }

    if (item.bodyRenderer) {
        return {
            render: item.bodyRenderer,
        }
    }

    return null
}
</script>