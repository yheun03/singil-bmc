<template>
    <SitePlayersPage
        title="타자"
        description="다윗 야구 선교단 타자 명단입니다."
        :roster="batters"
        :pending="pending"
        :error="error"
    />
</template>

<script setup lang="ts">
definePageMeta({ title: '타자' });

const { batters, pending, error } = usePlayers();
</script>
