<template>
    <div class="bmc-roster">
        <ul class="bmc-roster__grid">
            <li v-for="player in players" :key="player.playerId">
                <article class="bmc-roster-card">
                    <div class="bmc-roster-card__photo">
                        <img
                            :src="playerImageUrl(player.image)"
                            :alt="`${player.name} 선수 사진`"
                            loading="lazy"
                            width="320"
                            height="400"
                            @error="onPlayerImageError"
                        />
                        <span v-if="player.backNumber !== undefined" class="bmc-roster-card__number">
                            {{ player.backNumber }}
                        </span>
                    </div>
                    <div class="bmc-roster-card__body">
                        <p class="bmc-roster-card__position">{{ formatPosition(player.position) }}</p>
                        <h3 class="bmc-roster-card__name">{{ player.name }}</h3>
                        <p class="bmc-roster-card__meta">
                            {{ player.group }}조
                            <span v-if="player.hand"> | {{ player.hand }}</span>
                        </p>
                        <AppButton
                            v-if="player.gameoneProfileUrl"
                            class="bmc-roster-card__profile"
                            :href="player.gameoneProfileUrl"
                            new-tab
                            variant="fill"
                            tone="primary"
                            size="sm"
                            shape="pill"
                        >
                            게임원 프로필
                            <template #iconRight>
                                <Icon icon="mdi:open-in-new" />
                            </template>
                        </AppButton>
                    </div>
                </article>
            </li>
        </ul>
        <p v-if="!players.length" class="bmc-state">등록된 선수가 없습니다.</p>
    </div>
</template>

<script setup lang="ts">
import type { Player } from '~/composables/usePlayers';

defineProps<{
    players: Player[];
}>();

const { playerImageUrl, onPlayerImageError } = usePlayerImage();

function formatPosition(position?: string) {
    if (!position) return '-';
    if (position === 'MGR') return '감독';
    return position;
}
</script>
