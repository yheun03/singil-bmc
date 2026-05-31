<template>
    <SitePageLayout
        eyebrow="BEARS TV"
        title="YouTube 영상"
        description="선교단 영상과 채널 바로가기"
        :pending="pending"
        :error="error"
    >
        <div style="margin-bottom:20px;">
            <a
                class="bmc-btn bmc-btn--primary"
                :href="YOUTUBE_CHANNEL_URL"
                target="_blank"
                rel="noopener noreferrer"
            >
                YouTube 채널 바로가기
            </a>
        </div>
        <div class="bmc-grid bmc-grid--2">
            <article v-for="video in videos" :key="video.id" class="bmc-video-card">
                <span class="bmc-video-card__badge">{{ video.category }}</span>
                <h3 style="margin:0;font-size:1rem;font-weight:800;">{{ video.title }}</h3>
                <p style="margin:0;color:#6b7280;font-size:0.875rem;">{{ video.date }}</p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
import { YOUTUBE_CHANNEL_URL } from '~/constants/site';

type VideoItem = { id: string; title: string; category: string; date: string };

definePageMeta({ title: 'YouTube 영상' });

const { data: videos, pending, error } = useSiteData<VideoItem[]>('meta/videos.json');
</script>
