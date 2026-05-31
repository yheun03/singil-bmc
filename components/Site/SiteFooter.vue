<template>
    <footer class="bmc-footer">
        <div class="bmc-footer__inner">
            <p class="bmc-footer__brand">신길교회 야구 선교단</p>
            <p class="bmc-footer__desc">
                야구를 통해 교제하고, 함께 땀 흘리며, 복음의 가치를 나누는 공동체입니다.
            </p>
            <div class="bmc-footer__links">
                <NuxtLink to="/records">기록</NuxtLink>
                <!-- <NuxtLink to="/gallery/team">단체사진</NuxtLink> -->
                <NuxtLink to="/videos">YouTube</NuxtLink>
                <NuxtLink to="/contact">문의</NuxtLink>
                <a :href="YOUTUBE_CHANNEL_URL" target="_blank" rel="noopener noreferrer">
                    다윗야구선교단 채널
                </a>
            </div>
            <p class="bmc-footer__copy">© {{ year }} 신길교회 야구 선교단. All rights reserved.</p>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { YOUTUBE_CHANNEL_URL } from '~/constants/site';

const year = new Date().getFullYear();
</script>
