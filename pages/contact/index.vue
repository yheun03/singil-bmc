<template>
    <SitePageLayout
        eyebrow="CONTACT"
        title="문의"
        description="선교단 참여 및 문의 안내"
    >
        <div class="bmc-contact-box">
            <p>신길교회 야구 선교단 참여 및 문의는 아래 연락처로 문의해 주세요.</p>
            <ul>
                <li><strong>대표 감독</strong> · 노재흥</li>
                <li><strong>D조 감독</strong> · 성백동 집사</li>
                <li><strong>총무</strong> · 노승원 집사</li>
                <li>
                    <strong>홈페이지 담당</strong> · 은영환 청년 ·
                    <a href="mailto:eyh208@naver.com">eyh208@naver.com</a>
                </li>
                <li><strong>활동</strong> · 정기 연습, 친선·리그 경기, 교제</li>
            </ul>
            <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
                <NuxtLink class="bmc-btn bmc-btn--primary" to="/about/leaders">운영진 소개</NuxtLink>
                <a
                    class="bmc-btn bmc-btn--light"
                    :href="YOUTUBE_CHANNEL_URL"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    YouTube 채널
                </a>
            </div>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
import { YOUTUBE_CHANNEL_URL } from '~/constants/site';

definePageMeta({ title: '문의' });
</script>
