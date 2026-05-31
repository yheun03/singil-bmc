<template>
    <SitePageLayout eyebrow="PLAYERS" title="선수" description="다윗 야구 선교단 선수 명단입니다." :pending="pending" :error="error">
        <div class="bmc-grid bmc-grid--3">
            <article v-for="player in players" :key="player.playerId" class="bmc-player-card">
                <span class="bmc-player-card__number">#{{ player.backNumber || '-' }}</span>
                <h3>{{ player.name }}</h3>
                <p>{{ player.group }}조 · {{ player.position || '-' }}</p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type Player = {
    playerId: string;
    name: string;
    group: string;
    backNumber?: number;
    position?: string;
};

definePageMeta({ title: '선수' });

const { data, pending, error } = useSiteData<Player[]>('meta/players.json');
const players = computed(() => data.value ?? []);
</script>

<style scoped lang="scss">
.bmc-player-card {
    display: grid;
    gap: 8px;
    padding: 22px;
    border: 1px solid #d8dee9;
    border-radius: 8px;
    background: #fff;

    h3,
    p {
        margin: 0;
    }

    h3 {
        font-size: 1.125rem;
        font-weight: 900;
    }
}

.bmc-player-card__number {
    font-size: 0.875rem;
    font-weight: 900;
    color: #1e56c8;
}
</style>
