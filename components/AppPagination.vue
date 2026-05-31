<template>
    <nav class="app-pagination" :class="[
        `app-pagination--${size}`,
        {
            'is-disabled': disabled,
        },
    ]" aria-label="페이지네이션">
        <div v-if="showTotal" class="app-pagination__total">
            총 <strong>{{ total }}</strong>건
        </div>

        <div class="app-pagination__controls">
            <button type="button" class="app-pagination__button" :disabled="disabled || isFirstPage" aria-label="첫 페이지"
                @click="setPage(1)">
                <Icon icon="mdi:chevron-double-left" />
            </button>

            <button type="button" class="app-pagination__button" :disabled="disabled || isFirstPage" aria-label="이전 페이지"
                @click="setPage(page - 1)">
                <Icon icon="mdi:chevron-left" />
            </button>

            <button v-for="pageNumber in visiblePages" :key="pageNumber" type="button"
                class="app-pagination__button app-pagination__page" :class="{ 'is-active': pageNumber === page }"
                :disabled="disabled" :aria-current="pageNumber === page ? 'page' : undefined"
                @click="setPage(pageNumber)">
                {{ pageNumber }}
            </button>

            <button type="button" class="app-pagination__button" :disabled="disabled || isLastPage" aria-label="다음 페이지"
                @click="setPage(page + 1)">
                <Icon icon="mdi:chevron-right" />
            </button>

            <button type="button" class="app-pagination__button" :disabled="disabled || isLastPage" aria-label="마지막 페이지"
                @click="setPage(totalPages)">
                <Icon icon="mdi:chevron-double-right" />
            </button>
        </div>

        <div v-if="showPageSize" class="app-pagination__size">
            <AppSelect :model-value="pageSize" :options="pageSizeSelectOptions" :disabled="disabled"
                @update:model-value="setPageSize" />
        </div>
    </nav>
</template>

<script setup lang="ts">
type AppPaginationSize = 'sm' | 'md'

const props = withDefaults(
    defineProps<{
        page: number
        pageSize: number
        total: number
        pageSizeOptions?: number[]
        siblingCount?: number
        showTotal?: boolean
        showPageSize?: boolean
        disabled?: boolean
        size?: AppPaginationSize
    }>(),
    {
        pageSizeOptions: () => [10, 20, 50, 100],
        siblingCount: 1,
        showTotal: true,
        showPageSize: true,
        disabled: false,
        size: 'md',
    },
)

const emit = defineEmits<{
    (e: 'update:page', value: number): void
    (e: 'update:pageSize', value: number): void
    (e: 'change', payload: { page: number; pageSize: number }): void
}>()

const totalPages = computed(() => {
    if (!props.total || !props.pageSize) return 1

    return Math.max(1, Math.ceil(props.total / props.pageSize))
})

const normalizedPage = computed(() => {
    return Math.min(Math.max(props.page, 1), totalPages.value)
})

const isFirstPage = computed(() => normalizedPage.value <= 1)
const isLastPage = computed(() => normalizedPage.value >= totalPages.value)

const pageSizeSelectOptions = computed(() =>
    props.pageSizeOptions.map((size) => ({
        label: `${size}개씩 보기`,
        value: size,
    })),
)

const visiblePages = computed(() => {
    const total = totalPages.value
    const current = normalizedPage.value
    const sibling = props.siblingCount

    const start = Math.max(1, current - sibling)
    const end = Math.min(total, current + sibling)

    const pages: number[] = []

    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
        pages.push(pageNumber)
    }

    if (!pages.includes(1)) {
        pages.unshift(1)
    }

    if (!pages.includes(total)) {
        pages.push(total)
    }

    return [...new Set(pages)].sort((a, b) => a - b)
})

watch(
    () => [props.page, props.pageSize, props.total],
    () => {
        if (props.page === normalizedPage.value) return

        emit('update:page', normalizedPage.value)
        emit('change', {
            page: normalizedPage.value,
            pageSize: props.pageSize,
        })
    },
)

function setPage(nextPage: number) {
    const next = Math.min(Math.max(nextPage, 1), totalPages.value)

    if (next === props.page) return

    emit('update:page', next)
    emit('change', {
        page: next,
        pageSize: props.pageSize,
    })
}

function setPageSize(value: string | number | boolean | null) {
    if (typeof value === 'boolean' || value === null) return

    const nextPageSize = Number(value)

    if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) return

    emit('update:pageSize', nextPageSize)
    emit('update:page', 1)
    emit('change', {
        page: 1,
        pageSize: nextPageSize,
    })
}
</script>