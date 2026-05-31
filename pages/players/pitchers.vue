<template>
    <SitePlayersPage
        title="투수"
        description="다윗 야구 선교단 투수 명단입니다."
        :roster="pitchers"
        :pending="pending"
        :error="error"
    />
</template>

<script setup lang="ts">
definePageMeta({ title: '투수' });

const { pitchers, pending, error } = usePlayers();
</script>
