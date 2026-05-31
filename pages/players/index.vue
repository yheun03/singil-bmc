<template>
    <SitePlayersPage
        title="선수"
        description="다윗 야구 선교단 선수 명단입니다."
        :roster="players"
        :pending="pending"
        :error="error"
    />
</template>

<script setup lang="ts">
definePageMeta({ title: '선수' });

const { players, pending, error } = usePlayers();
</script>
