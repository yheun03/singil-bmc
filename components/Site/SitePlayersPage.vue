<template>
    <SitePageLayout
        eyebrow="PLAYERS"
        :title="title"
        :description="description"
        :pending="pending"
        :error="error"
    >
        <SitePlayerRoster :players="roster" :summary="summary" />
    </SitePageLayout>
</template>

<script setup lang="ts">
import type { RosterPlayer } from '~/composables/usePlayers';

defineProps<{
    title: string;
    description: string;
    roster: RosterPlayer[];
    summary?: string;
    pending?: boolean;
    error?: string;
}>();
</script>
