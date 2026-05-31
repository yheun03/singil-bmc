<template>
    <div class="app-grid-choice">

        <AppChoice v-for="opt in options" :key="opt.value" v-model="value" :type="type" :value="opt.value"
            :label="opt.label" :name="radioName" size="sm" />

    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    params: Object
})

const params = props.params

const options =
    params?.colDef?.cellRendererParams?.options ?? []

const type =
    params?.colDef?.cellRendererParams?.type ?? 'radio'

const radioName =
    `${params?.column?.getColId()}-${params?.node?.id}`

const value = computed({

    get: () => params?.value,

    set: (v) => {

        params?.node?.setDataValue(
            params?.column?.getColId(),
            v
        )

    }

})

</script>