<template>
    <div class="page-demo-stack">
        <p>호출 시 전달한 component가 모달 body를 구성합니다.</p>
        <p>현재 마지막 액션: {{ lastAction }}</p>

        <div class="page-demo-actions">
            <AppButton variant="fill" @click="onClickAction">
                액션 실행
            </AppButton>

            <AppButton variant="outline" @click="onClickNestedAlert">
                Alert 중첩 열기
            </AppButton>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    lastAction: string
    onAction?: () => void
    onNestedAlert?: () => void
}>()

function onClickAction() {
    props.onAction?.()
}

function onClickNestedAlert() {
    props.onNestedAlert?.()
}
</script>