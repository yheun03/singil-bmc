<template>
    <SitePageLayout
        eyebrow="GALLERY"
        title="단체사진"
        description="정기 경기 및 행사 단체사진"
        :pending="pending"
        :error="error"
    >
        <div class="bmc-grid bmc-grid--3">
            <article v-for="item in gallery" :key="item.id" class="bmc-gallery-card">
                <div
                    style="height:140px;border-radius:12px;background:linear-gradient(135deg,#132a5f,#1e56c8);display:grid;place-items:center;color:#fff;font-size:2rem;margin-bottom:8px;"
                >
                    📷
                </div>
                <h3 style="margin:0;font-size:0.9375rem;font-weight:800;">{{ item.title }}</h3>
                <p style="margin:0;color:#6b7280;font-size:0.8125rem;">{{ item.date }} · {{ item.category }}</p>
            </article>
        </div>
    </SitePageLayout>
</template>

<script setup lang="ts">
type GalleryItem = { id: string; title: string; date: string; category: string };

definePageMeta({ title: '단체사진' });

const { data: gallery, pending, error } = useSiteData<GalleryItem[]>('meta/gallery.json');
</script>
