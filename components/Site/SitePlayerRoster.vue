<template>
    <div class="bmc-roster">
        <p v-if="summary" class="bmc-roster__summary">{{ summary }}</p>

        <ul class="bmc-roster__grid">
            <li v-for="player in players" :key="player.rosterId">
                <article class="bmc-roster-card" :class="{ 'bmc-roster-card--dual': player.isDualGroup }">
                    <div class="bmc-roster-card__photo">
                        <!-- <div class="bmc-roster-card__groups" aria-label="소속 조">
                            <span
                                v-for="group in player.groups"
                                :key="group"
                                class="bmc-roster-card__group-pill"
                            >
                                {{ group }}조
                            </span>
                        </div> -->

                        <img :src="playerImageUrl(player.image)" :alt="`${player.name} 선수 사진`" loading="lazy"
                            width="320" height="400" @error="onPlayerImageError" />

                        <div v-if="rosterBackNumberMarkup(player)" class="bmc-roster-card__number-slot"
                            v-html="rosterBackNumberMarkup(player)" />
                    </div>

                    <div class="bmc-roster-card__body">
                        <!-- <p v-if="player.isDualGroup" class="bmc-roster-card__badge">A·D조 활동</p> -->
                        <p class="bmc-roster-card__position" v-html="rosterPositionMarkup(player)" />
                        <h3 class="bmc-roster-card__name">{{ player.name }}</h3>
                        <p class="bmc-roster-card__meta">
                            {{ formatRosterGroups(player) }}
                            <span v-if="player.hand"> · {{ player.hand }}</span>
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
import type { RosterPlayer } from '~/composables/usePlayers';
import {
    formatRosterGroups,
    rosterBackNumberMarkup,
    rosterPositionMarkup,
} from '~/composables/usePlayers';

defineProps<{
    players: RosterPlayer[];
    summary?: string;
}>();

const { playerImageUrl, onPlayerImageError } = usePlayerImage();
</script>
