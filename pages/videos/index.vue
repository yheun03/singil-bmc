<template>
    <SitePageLayout eyebrow="David TV" title="YouTube 영상" description="선교단 영상과 채널 바로가기" :pending="pending"
        :error="error">
        <div style="margin-bottom:20px;">
            <a class="bmc-btn bmc-btn--primary" :href="YOUTUBE_CHANNEL_URL" target="_blank" rel="noopener noreferrer">
                YouTube 채널 바로가기
            </a>
        </div>
        <div class="bmc-grid bmc-grid--2">
            <article v-for="video in videos" :key="video.id" class="bmc-video-card">
                <a class="bmc-video-card__thumb" :href="video.youtubeUrl || YOUTUBE_CHANNEL_URL" target="_blank"
                    rel="noopener noreferrer" :aria-label="`${video.title} 영상 보기`">
                    <img v-if="video.thumbnail" :src="video.thumbnail" :alt="video.title" loading="lazy"
                        referrerpolicy="no-referrer">
                    <span v-else class="bmc-video-card__placeholder">YouTube</span>
                </a>
                <div class="bmc-video-card__body">
                    <span class="bmc-video-card__badge">{{ video.category }}</span>
                    <h3 class="bmc-video-card__title">{{ video.title }}</h3>
                    <p class="bmc-video-card__date">{{ video.date }}</p>
                    <a class="bmc-btn bmc-btn--primary bmc-video-card__link"
                        :href="video.youtubeUrl || YOUTUBE_CHANNEL_URL" target="_blank" rel="noopener noreferrer">
                        영상 보기
                    </a>
                </div>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
import { YOUTUBE_CHANNEL_URL } from '~/constants/site';

type VideoItem = {
    id: string;
    title: string;
    category: string;
    date: string;
    youtubeUrl?: string;
    thumbnail?: string;
};

definePageMeta({ title: 'YouTube 영상' });

const { fetchJson } = useBasePath();
const videos = ref<VideoItem[]>([]);
const pending = ref(true);
const error = ref('');

function sortVideosByDateDesc(items: VideoItem[]) {
    return [...items].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return Date.parse(b.date) - Date.parse(a.date);
    });
}

onMounted(async () => {
    try {
        const [generatedVideos, manualVideos] = await Promise.all([
            fetchJson<VideoItem[]>('generated/videos.json').catch(() => []),
            fetchJson<VideoItem[]>('meta/videos.json'),
        ]);
        videos.value = sortVideosByDateDesc([...generatedVideos, ...manualVideos]);
    } catch (err) {
        error.value = err instanceof Error ? err.message : '영상 데이터를 불러오지 못했습니다.';
    } finally {
        pending.value = false;
    }
});
</script>
