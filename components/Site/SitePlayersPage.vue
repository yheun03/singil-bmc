<template>
    <SitePageLayout
        eyebrow="PLAYERS"
        :title="title"
        :description="description"
        :pending="pending"
        :error="error"
    >
        <SitePlayerRoster :players="roster" />
    </SitePageLayout>
</template>

<script setup lang="ts">
import type { Player } from '~/composables/usePlayers';

defineProps<{
    title: string;
    description: string;
    roster: Player[];
    pending?: boolean;
    error?: string;
}>();
</script>
