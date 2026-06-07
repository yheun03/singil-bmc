<template>
    <SitePageLayout
        eyebrow="STATS"
        title="MVP"
        description="월별·주간 MVP 수상자를 기간·조별로 확인합니다."
        :pending="pending"
        :error="error"
    >
        <AppTabs
            v-model:active-id="mvpType"
            :items="typeTabItems"
            variant="pill"
            size="md"
            stretch
            class="bmc-mvp-type-tabs"
        />
        <SiteMvpBoard
            v-if="mvpType === 'monthly'"
            :items="monthlyList ?? []"
            mode="monthly"
        />
        <SiteMvpBoard
            v-else
            :items="weeklyList ?? []"
            mode="weekly"
        />
    </SitePageLayout>
</template>

<script setup lang="ts">
import type { MvpBoardEntry } from '~/utils/mvp-display';

definePageMeta({ title: 'MVP' });

const route = useRoute();
const router = useRouter();

type MvpType = 'monthly' | 'weekly';

function readMvpType(): MvpType {
    const raw = route.query.type;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value === 'weekly' ? 'weekly' : 'monthly';
}

const mvpType = ref<MvpType>(readMvpType());

watch(
    () => route.query.type,
    () => {
        mvpType.value = readMvpType();
    },
);

watch(mvpType, (value) => {
    const current = readMvpType();
    if (current === value) return;
    router.replace({ path: '/mvp', query: { type: value } });
});

const { data: monthlyList, pending: monthlyPending, error: monthlyError } =
    useSiteData<MvpBoardEntry[]>('summary/mvp-monthly.json');
const { data: weeklyList, pending: weeklyPending, error: weeklyError } =
    useSiteData<MvpBoardEntry[]>('summary/mvp-weekly.json');

const pending = computed(() => (mvpType.value === 'monthly' ? monthlyPending.value : weeklyPending.value));
const error = computed(() => {
    const err = mvpType.value === 'monthly' ? monthlyError.value : weeklyError.value;
    return err ? 'MVP 데이터를 불러오지 못했습니다.' : '';
});

const typeTabItems = [
    {
        id: 'monthly',
        title: '월별 MVP',
        desc: '월간 타자·투수 순위',
        icon: 'mdi:calendar-month',
    },
    {
        id: 'weekly',
        title: '주간 MVP',
        desc: '주차별 타자·투수 순위',
        icon: 'mdi:calendar-week',
    },
];
</script>
