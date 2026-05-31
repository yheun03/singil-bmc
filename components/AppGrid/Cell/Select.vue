<template>
    <AppSelect v-model="value" :options="options" size="sm" />
</template>

<script setup lang="ts">

const props = defineProps({
    params: Object
})

const params = props.params

const options =
    params?.colDef?.cellRendererParams?.options ?? []

const value = computed({
    get: () => params?.value,
    set: (v) => {
        params?.node?.setDataValue(params?.column?.getColId(), v)
    }
})

</script>