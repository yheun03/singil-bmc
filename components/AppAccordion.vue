<template>
    <div class="app-accordion">
        <div v-for="item in normalizedItems" :key="item.id" class="app-accordion__item" :class="{
            'is-open': isOpen(item.id),
            'is-disabled': item.disabled,
        }">
            <button :id="getTriggerId(item.id)" type="button" class="app-accordion__trigger" :disabled="item.disabled"
                :aria-expanded="isOpen(item.id)" :aria-controls="getPanelId(item.id)" @click="toggleItem(item.id)">
                <div class="app-accordion__trigger-content">
                    <div class="app-accordion__text">
                        <strong class="app-accordion__title">
                            {{ item.title }}
                        </strong>

                        <p v-if="item.desc" class="app-accordion__desc">
                            {{ item.desc }}
                        </p>
                    </div>

                    <span class="app-accordion__icon" :class="{ 'is-open': isOpen(item.id) }" aria-hidden="true">
                        <Icon icon="mdi:chevron-down" />
                    </span>
                </div>
            </button>

            <div v-show="isOpen(item.id)" :id="getPanelId(item.id)" class="app-accordion__panel" role="region"
                :aria-labelledby="getTriggerId(item.id)">
                <div class="app-accordion__panel-inner">
                    <component :is="getRendererComponent(item)" v-if="getRendererComponent(item)" />

                    <slot v-else-if="item.slot" :name="item.slot" :item="item" />

                    <div v-else class="app-accordion__empty">
                        내용이 없습니다.
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { Component, VNodeChild } from 'vue'

type AccordionRenderer = () => VNodeChild
type AccordionOpenMode = 'single' | 'multiple'
type AccordionInitialOpen = 'none' | 'first' | 'all'

export type AppAccordionItem = {
    id: string | number
    title: string
    desc?: string
    disabled?: boolean
    slot?: string
    bodyRenderer?: AccordionRenderer
    component?: Component
    componentProps?: Record<string, unknown>
}

const props = withDefaults(
    defineProps<{
        items: AppAccordionItem[]
        openIds?: Array<string | number>
        defaultOpenIds?: Array<string | number>
        mode?: AccordionOpenMode
        initialOpen?: AccordionInitialOpen
    }>(),
    {
        openIds: undefined,
        defaultOpenIds: undefined,
        mode: 'multiple',
        initialOpen: 'none',
    },
)

const emit = defineEmits<{
    (e: 'update:openIds', value: Array<string | number>): void
    (e: 'toggle', payload: { id: string | number; open: boolean }): void
}>()

const normalizedItems = computed(() => props.items ?? [])

const isControlled = computed(() => Array.isArray(props.openIds))

function getInitialOpenIds() {
    if (Array.isArray(props.defaultOpenIds)) {
        return [...props.defaultOpenIds]
    }

    if (props.initialOpen === 'all') {
        return normalizedItems.value
            .filter((item) => !item.disabled)
            .map((item) => item.id)
    }

    if (props.initialOpen === 'first') {
        const firstEnabledItem = normalizedItems.value.find((item) => !item.disabled)
        return firstEnabledItem ? [firstEnabledItem.id] : []
    }

    return []
}

const internalOpenIds = ref<Array<string | number>>(getInitialOpenIds())

watch(
    () => [props.items, props.defaultOpenIds, props.initialOpen],
    () => {
        if (isControlled.value) return
        internalOpenIds.value = getInitialOpenIds()
    },
    { deep: true },
)

const currentOpenIds = computed(() => {
    return isControlled.value ? props.openIds ?? [] : internalOpenIds.value
})

function setOpenIds(next: Array<string | number>) {
    if (!isControlled.value) {
        internalOpenIds.value = next
    }

    emit('update:openIds', next)
}

function isOpen(id: string | number) {
    return currentOpenIds.value.includes(id)
}

function toggleItem(id: string | number) {
    const target = normalizedItems.value.find((item) => item.id === id)

    if (!target || target.disabled) return

    const currentlyOpen = isOpen(id)
    let next: Array<string | number> = []

    if (props.mode === 'single') {
        next = currentlyOpen ? [] : [id]
    } else {
        next = currentlyOpen
            ? currentOpenIds.value.filter((openId) => openId !== id)
            : [...currentOpenIds.value, id]
    }

    setOpenIds(next)
    emit('toggle', { id, open: !currentlyOpen })
}

function getPanelId(id: string | number) {
    return `app-accordion-panel-${id}`
}

function getTriggerId(id: string | number) {
    return `app-accordion-trigger-${id}`
}

function getRendererComponent(item: AppAccordionItem) {
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