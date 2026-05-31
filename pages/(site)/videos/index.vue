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
                <a
                    class="bmc-btn bmc-btn--outline-light"
                    :href="video.youtubeUrl || YOUTUBE_CHANNEL_URL"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    영상 보기
                </a>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
import { YOUTUBE_CHANNEL_URL } from '~/constants/site';

type VideoItem = { id: string; title: string; category: string; date: string; youtubeUrl?: string };

definePageMeta({ title: 'YouTube 영상' });

const { fetchJson } = useBasePath();
const videos = ref<VideoItem[]>([]);
const pending = ref(true);
const error = ref('');

onMounted(async () => {
    try {
        const [generatedVideos, manualVideos] = await Promise.all([
            fetchJson<VideoItem[]>('generated/videos.json').catch(() => []),
            fetchJson<VideoItem[]>('meta/videos.json'),
        ]);
        videos.value = [...generatedVideos, ...manualVideos];
    } catch (err) {
        error.value = err instanceof Error ? err.message : '영상 데이터를 불러오지 못했습니다.';
    } finally {
        pending.value = false;
    }
});
</script>
