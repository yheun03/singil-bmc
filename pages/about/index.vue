<template>
    <SitePageLayout
        eyebrow="ABOUT"
        title="선교단 소개"
        description="신길교회 야구 선교단은 A·D 두 조로 활동하며, 야구를 통해 교제와 선교를 실천합니다."
    >
        <div class="bmc-about-intro">
            <p>
                <strong>신길교회 야구 선교단</strong>은 교회 성도와 지인들이 모여 정기적으로 야구를 즐기는 공동체입니다.
                단순히 경기 결과를 넘어, 함께 연습하고, 함께 응원하며, 함께 땀 흘리는 과정 속에서
                그리스도 안의 교제를 나눕니다.
            </p>
            <p>
                A조와 D조로 나누어 활동하며, 게임원 리그 및 친선 경기에 참여합니다.
                경기 기록은 홈페이지에 공유되어, 선수·가족·교회 공동체가 함께 기억하고 축하할 수 있습니다.
            </p>
        </div>

        <div class="bmc-grid bmc-grid--3" style="margin-top:20px;">
            <article class="bmc-stat-card">
                <strong>2</strong>
                <span>활동 조 (A·D)</span>
            </article>
            <article class="bmc-stat-card">
                <strong>정기</strong>
                <span>연습 · 친선 · 리그</span>
            </article>
            <article class="bmc-stat-card">
                <strong>ALL</strong>
                <span>누구나 환영</span>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
definePageMeta({ title: '선교단 소개' });
</script>
