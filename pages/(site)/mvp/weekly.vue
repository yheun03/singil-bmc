<template>
    <SitePageLayout
        eyebrow="MVP"
        title="주간 MVP"
        description="주간 MVP 수상자를 소개합니다."
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--2">
            <article v-for="item in mvpList" :key="item.id" class="bmc-mvp-card">
                <span class="bmc-mvp-card__badge">{{ item.title }}</span>
                <h3 style="margin:0;font-size:1.125rem;font-weight:800;">{{ item.name }} ({{ item.group }}조)</h3>
                <p style="margin:0;color:#6b7280;line-height:1.6;">{{ item.summary }}</p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type WeeklyMvp = { id: string; title: string; name: string; group: string; summary: string };

definePageMeta({ title: '주간 MVP' });

const { data: mvpList, pending, error } = useSiteData<WeeklyMvp[]>('summary/mvp-weekly.json');
</script>
