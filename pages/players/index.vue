<template>
    <SitePlayersPage
        title="선수"
        description="다윗 야구 선교단 선수 명단입니다."
        :roster="roster"
        :summary="rosterSummary"
        :pending="pending"
        :error="error"
    />
</template>

<script setup lang="ts">
definePageMeta({ title: '선수' });

const { roster, rosterSummary, pending, error } = usePlayers();
</script>
