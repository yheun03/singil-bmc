<template>
    <SitePageLayout
        eyebrow="STAFF"
        title="조직 / 섬김이"
        description="선교단을 이끄는 감독과 총무를 소개합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--3">
            <article v-for="leader in leaders || []" :key="leader.id" class="bmc-leader-card">
                <div class="bmc-leader-card__avatar">{{ leader.name.slice(0, 1) }}</div>
                <div>
                    <p class="bmc-leader-card__role">{{ leader.role }}</p>
                    <h3 class="bmc-leader-card__name">{{ leader.name }}</h3>
                    <span v-if="leader.group !== '전체'" class="bmc-leader-card__group">{{ leader.group }}조</span>
                    <p class="bmc-leader-card__message">{{ leader.message }}</p>
                </div>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type Leader = {
    id: string;
    group: string;
    role: string;
    name: string;
    message: string;
};

definePageMeta({ title: '조직/섬김이' });

const { data: leaders, pending, error } = useSiteData<Leader[]>('meta/leaders.json');
</script>
