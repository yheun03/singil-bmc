<template>
    <div class="bmc-mvp-board">
        <div class="bmc-mvp-board__toolbar">
            <label class="bmc-mvp-board__period">
                <span class="bmc-mvp-board__period-label">기간</span>
                <select v-model="selectedPeriodKey" class="bmc-mvp-board__period-select">
                    <option v-for="block in periodBlocks" :key="block.key" :value="block.key">
                        {{ block.label }}
                    </option>
                </select>
            </label>
            <AppTabs
                v-model:active-id="selectedGroup"
                :items="groupTabItems"
                variant="pill"
                size="sm"
                class="bmc-mvp-board__groups"
            />
        </div>

        <details class="bmc-mvp-board__rules">
            <summary>산정 기준</summary>
            <p>{{ rulesText }}</p>
        </details>

        <p v-if="!activeBlock" class="bmc-state">표시할 MVP 데이터가 없습니다.</p>

        <section v-else class="bmc-mvp-board__period" :aria-label="`${activeBlock.label} MVP`">
            <header class="bmc-mvp-board__period-head">
                <h2 class="bmc-mvp-board__period-title">{{ activeBlock.label }}</h2>
                <button
                    v-if="periodBlocks.length > 1"
                    type="button"
                    class="bmc-mvp-board__expand"
                    @click="showAllPeriods = !showAllPeriods"
                >
                    {{ showAllPeriods ? '선택 기간만 보기' : '전체 기간 펼치기' }}
                </button>
            </header>

            <div v-for="block in visibleBlocks" :key="block.key" class="bmc-mvp-board__period-block">
                <h3 v-if="showAllPeriods && periodBlocks.length > 1" class="bmc-mvp-board__subperiod">
                    {{ block.label }}
                </h3>

                <div class="bmc-mvp-board__columns">
                    <div
                        v-for="groupBlock in block.groups"
                        :key="`${block.key}-${groupBlock.group}`"
                        class="bmc-mvp-board__column"
                    >
                        <p class="bmc-mvp-board__group-label">{{ groupBlock.group }}조</p>

                        <div class="bmc-mvp-board__panels">
                            <article class="bmc-mvp-board__panel">
                                <h4 class="bmc-mvp-board__panel-title">타자 MVP</h4>
                                <table v-if="groupBlock.batting.length" class="bmc-mvp-board__table">
                                    <thead>
                                        <tr>
                                            <th scope="col">순위</th>
                                            <th scope="col">선수</th>
                                            <th scope="col">기록</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="entry in groupBlock.batting"
                                            :key="entry.id"
                                            :class="{ 'is-top': entry.rank === 1 }"
                                        >
                                            <td>
                                                <span class="bmc-mvp-board__rank" :data-rank="entry.rank">
                                                    {{ mvpRankLabel(entry.rank) }}
                                                </span>
                                            </td>
                                            <td class="bmc-mvp-board__name">{{ entry.name }}</td>
                                            <td class="bmc-mvp-board__stats">
                                                <span>{{ formatMvpStatsLine(entry) }}</span>
                                                <small v-if="entry.stats?.score != null">점수 {{ entry.stats.score }}</small>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p v-else class="bmc-mvp-board__empty">해당 기간 데이터 없음</p>
                            </article>

                            <article class="bmc-mvp-board__panel">
                                <h4 class="bmc-mvp-board__panel-title">투수 MVP</h4>
                                <table v-if="groupBlock.pitching.length" class="bmc-mvp-board__table">
                                    <thead>
                                        <tr>
                                            <th scope="col">순위</th>
                                            <th scope="col">선수</th>
                                            <th scope="col">기록</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="entry in groupBlock.pitching"
                                            :key="entry.id"
                                            :class="{ 'is-top': entry.rank === 1 }"
                                        >
                                            <td>
                                                <span class="bmc-mvp-board__rank" :data-rank="entry.rank">
                                                    {{ mvpRankLabel(entry.rank) }}
                                                </span>
                                            </td>
                                            <td class="bmc-mvp-board__name">{{ entry.name }}</td>
                                            <td class="bmc-mvp-board__stats">
                                                <span>{{ formatMvpStatsLine(entry) }}</span>
                                                <small v-if="entry.stats?.score != null">점수 {{ entry.stats.score }}</small>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p v-else class="bmc-mvp-board__empty">해당 기간 데이터 없음</p>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import {
    buildMvpPeriodBlocks,
    formatMvpStatsLine,
    mvpRankLabel,
    type MvpBoardEntry,
} from '~/utils/mvp-display';

const props = defineProps<{
    items: MvpBoardEntry[];
    mode: 'monthly' | 'weekly';
}>();

const rulesText = computed(() =>
    props.mode === 'monthly'
        ? '월간 MVP는 YYYY-MM 월과 조를 기준으로 타자/투수를 나누어 3위까지 자동 산정합니다. 타자는 안타, 타점, 득점, 도루, 홈런을 반영하고 투수는 아웃카운트, 탈삼진, 승, 세이브, 자책점을 반영합니다.'
        : '주간 MVP는 월요일 시작 주차와 조를 기준으로 타자/투수를 나누어 3위까지 자동 산정합니다. 타자는 안타, 타점, 득점, 도루, 홈런을 반영하고 투수는 아웃카운트, 탈삼진, 승, 세이브, 자책점을 반영합니다.',
);

const selectedGroup = ref<'all' | 'A' | 'D'>('all');
const selectedPeriodKey = ref('');
const showAllPeriods = ref(false);

const groupTabItems = [
    { id: 'all', title: '전체', bodyRenderer: () => null },
    { id: 'A', title: 'A조', bodyRenderer: () => null },
    { id: 'D', title: 'D조', bodyRenderer: () => null },
];

const periodBlocks = computed(() =>
    buildMvpPeriodBlocks(props.items, props.mode, selectedGroup.value),
);

watch(
    periodBlocks,
    (blocks) => {
        if (!blocks.length) {
            selectedPeriodKey.value = '';
            return;
        }
        if (!blocks.some((block) => block.key === selectedPeriodKey.value)) {
            selectedPeriodKey.value = blocks[0].key;
        }
    },
    { immediate: true },
);

const activeBlock = computed(() =>
    periodBlocks.value.find((block) => block.key === selectedPeriodKey.value) ?? null,
);

const visibleBlocks = computed(() => {
    if (showAllPeriods.value) return periodBlocks.value;
    return activeBlock.value ? [activeBlock.value] : [];
});
</script>
