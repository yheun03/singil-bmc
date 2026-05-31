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
            <div class="bmc-mvp-board__rules-body">
                <section class="bmc-mvp-board__rules-section">
                    <h3>공통</h3>
                    <ul>
                        <li>
                            GameOne에서 가져온 경기별 타자·투수 기록을 합산합니다.
                            {{ rules.periodLabel }}
                        </li>
                        <li>전체 선택 시 조 구분 없이 이름 기준으로 합산하고, 조를 선택하면 해당 조 기록만 표시합니다.</li>
                        <li>타자 MVP와 투수 MVP를 <strong>각 3위까지</strong> 자동 산정합니다.</li>
                        <li>순위는 기간·조·포지션(타자/투수)별 <strong>MVP 점수</strong>가 높은 순입니다. 표에 보이는 타율·ERA는 참고용이며, 순위 결정에는 사용하지 않습니다.</li>
                        <li>동점일 경우 같은 점수 내에서 시스템 기본 정렬 순서를 따릅니다.</li>
                    </ul>
                </section>

                <section class="bmc-mvp-board__rules-section">
                    <h3>타자 MVP</h3>
                    <p class="bmc-mvp-board__rules-formula">{{ rules.batting.formula }}</p>
                    <table class="bmc-mvp-board__rules-table">
                        <thead>
                            <tr>
                                <th scope="col">항목</th>
                                <th scope="col">가중치</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in rules.batting.weights" :key="row.label">
                                <td>{{ row.label }}</td>
                                <td>{{ row.weight }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="bmc-mvp-board__rules-example">
                        <p class="bmc-mvp-board__rules-example-title">예시 ({{ rules.batting.example.period }})</p>
                        <p>
                            <strong>{{ rules.batting.example.name }}</strong> —
                            {{ rules.batting.example.stats }}
                        </p>
                        <ul>
                            <li v-for="step in rules.batting.example.steps" :key="step">{{ step }}</li>
                        </ul>
                        <p class="bmc-mvp-board__rules-example-total">합계 <strong>{{ rules.batting.example.total }}</strong></p>
                    </div>
                </section>

                <section class="bmc-mvp-board__rules-section">
                    <h3>투수 MVP</h3>
                    <p class="bmc-mvp-board__rules-formula">{{ rules.pitching.formula }}</p>
                    <table class="bmc-mvp-board__rules-table">
                        <thead>
                            <tr>
                                <th scope="col">항목</th>
                                <th scope="col">가중치</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in rules.pitching.weights" :key="row.label">
                                <td>{{ row.label }}</td>
                                <td>{{ row.weight }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p class="bmc-mvp-board__rules-note">
                        이닝(IP)은 화면 표기용이며, 점수 계산에는 <strong>아웃카운트(outs)</strong>를 사용합니다.
                        예: 6.0이닝 = 18 outs.
                    </p>
                    <div class="bmc-mvp-board__rules-example">
                        <p class="bmc-mvp-board__rules-example-title">예시 ({{ rules.pitching.example.period }})</p>
                        <p>
                            <strong>{{ rules.pitching.example.name }}</strong> —
                            {{ rules.pitching.example.stats }}
                        </p>
                        <ul>
                            <li v-for="step in rules.pitching.example.steps" :key="step">{{ step }}</li>
                        </ul>
                        <p class="bmc-mvp-board__rules-example-total">합계 <strong>{{ rules.pitching.example.total }}</strong></p>
                    </div>
                </section>
            </div>
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
                        <p class="bmc-mvp-board__group-label">{{ groupBlock.group === 'all' ? '전체' : `${groupBlock.group}조` }}</p>

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
    buildMvpRulesContent,
    formatMvpStatsLine,
    mvpRankLabel,
    type MvpBoardEntry,
} from '~/utils/mvp-display';
import type { PeriodRecordSlice } from '~/utils/record-aggregate';

const props = defineProps<{
    items: MvpBoardEntry[];
    mode: 'monthly' | 'weekly';
}>();

const rules = computed(() => buildMvpRulesContent(props.mode));

const selectedGroup = ref('all');
const selectedPeriodKey = ref('');
const showAllPeriods = ref(false);

const { tabItemsForYear, groupIdsForYear } = useSeasonTeams();

const { data: monthlyRecords } = useSiteData<Array<PeriodRecordSlice & { key: string }>>(
    'summary/monthly-records.json',
);

const periodRecordsByKey = computed(() => {
    if (props.mode !== 'monthly') return {};
    const map: Record<string, PeriodRecordSlice> = {};
    for (const record of monthlyRecords.value ?? []) {
        map[record.key] = record;
    }
    return map;
});

const mvpSeasonYear = computed(() => {
    const key = selectedPeriodKey.value;
    if (!key) return new Date().getFullYear();
    const monthly = key.match(/^(\d{4})-\d{2}$/);
    if (monthly) return Number(monthly[1]);
    const weekly = key.match(/^(\d{4})-\d{2}-W\d+$/);
    if (weekly) return Number(weekly[1]);
    return new Date().getFullYear();
});

const groupTabItems = computed(() => tabItemsForYear(mvpSeasonYear.value));

const seasonGroupIds = computed(() => groupIdsForYear(mvpSeasonYear.value));

const periodBlocks = computed(() =>
    buildMvpPeriodBlocks(
        props.items,
        props.mode,
        selectedGroup.value,
        seasonGroupIds.value,
        periodRecordsByKey.value,
    ),
);

watch(mvpSeasonYear, () => {
    selectedGroup.value = 'all';
});

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
